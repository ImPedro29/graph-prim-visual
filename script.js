let NODES = [
    {
        x: 100,
        y: 200,
        id: 0,
        name: "Piru",
    },
    {
        x: 150,
        y: 400,
        id: 1,
        name: "Pussy",
    },
    {
        x: 650,
        y: 300,
        id: 2,
        name: "Banana",
    },
    {
        x: 450,
        y: 800,
        id: 3,
        name: "Jaca",
    },
    {
        x: 190,
        y: 600,
        id: 4,
        name: "Jumento",
    }
];

let EDGES = [
    {
        from: 1,
        to: 2,
        weight: 2, // peso
    },
    {
        from: 2,
        to: 3,
        weight: 3,// peso
    },
    {
        from: 1,
        to: 3,
        weight: 2, // peso
    },
    {
        from: 1,
        to: 4,
        weight: 4, // peso
    }
];

class Graph {
    constructor(nodes, edges) {
        this.nodes = nodes;
        this.edges = edges;
        this.nextId = 0;
        while (nodes.find(item => item.id === this.nextId)) {
            this.nextId++;
        }
    }

    setContext(ctx) {
        this.ctx = ctx;
    }

    render(color = "#333") {
        this.ctx.clearRect(0, 0, document.getElementById('draw').width, document.getElementById('draw').height);
        for (let edge of this.edges)
            this.renderEdge(edge, color);
        for (let node of this.nodes)
            this.renderNode(node);
    }

    renderEdge({from, to, weight, color}, colorReceived) {
        let fromNode = this.nodes.find(node => node.id === from);
        let toNode = this.nodes.find(node => node.id === to);

        this.ctx.beginPath();
        let {ctx} = this;
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        ctx.lineWidth = weight;
        ctx.strokeStyle = color || colorReceived;
        ctx.stroke();
        this.ctx.closePath();
    }

    renderNode({x, y}) {
        this.ctx.beginPath();
        let {ctx} = this;
        let img = document.createElement('img')
        img.src = "images/pole.png"
        img.onload = () => {
            ctx.drawImage(img, x - 50, y - 10, 100, 100)
            this.ctx.closePath();
        }
    }

    getNodes() {
        return this.nodes;
    }

    getEdges() {
        return this.edges;
    }

    addNode(name) {
        let x = Math.floor(Math.random() * (window.innerWidth - 100))
        let y = Math.floor(Math.random() * (window.innerHeight - 100))
        this.nodes.push({
            x,
            y,
            name,
            id: this.nextId++
        })
    }

    addEdge(from, to, weight, color) {
        from = parseInt(from)
        to = parseInt(to)
        weight = parseInt(weight)

        if (this.edges.find(edge => edge.from === from && edge.to === to)) {
            this.edges = this.edges.map(
                edge => edge.from === from && edge.to === to ?
                    {
                        from,
                        to,
                        weight,
                        color
                    }
                    : edge
            );

            return;
        }

        this.edges.push({
            from,
            to,
            weight,
            color
        });
    }

    async getSteps() {
        const edges = this.edges;
        let steps = [];
        for (let i = 0; i < edges.length; i++) {
            let edgesToSend = edges.slice(0, i + 1);
            let response = await fetch("http://localhost:5000/prim", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    tree: edgesToSend.map(item => ({
                        node_reference: item.from,
                        node_adjacent: item.to,
                        cost: item.weight
                    }))
                })
            })

            let json = (await response.json()).response;
            if (steps.length !== json.length) {
                steps.push(edgesToSend);
            }

        }
        return steps
    }
}

const GRAPH = new Graph(NODES, EDGES)
window.onload = () => {
    canvasSetRelativeSize();
    const canvas = document.getElementById('draw');
    GRAPH.setContext(canvas.getContext("2d"))
    GRAPH.render();

    //load
    loadData()

    //Print Steps
    printSteps();

    //Events
    document.getElementById('modalCloser').addEventListener('click', closeModal);
    document.getElementById('add').addEventListener('click', openModal);
}

function canvasSetRelativeSize() {
    let width = window.innerWidth;
    let height = window.innerHeight;

    const canvas = document.getElementById('draw');
    canvas.setAttribute('width', width);
    canvas.setAttribute('height', height);
}

function closeModal() {
    document.getElementById('modal').classList.add('hidden');
}

function openModal() { // Content should be a document
    let modal = document.getElementById('modal');
    modal.classList.remove('hidden');
}

function inputTypeChange(target) {
    let node = document.querySelector(".isNode")
    let edge = document.querySelector(".isEdge")
    switch (target.value) {
        case "node":
            node.classList.remove("hidden")
            edge.classList.add("hidden")
            break;
        case "edge":
            node.classList.add("hidden")
            edge.classList.remove("hidden")
            loadData()
            break;
    }
}

function add() {
    let type = document.getElementById('inputType').value;
    if (type === "node") {
        let name = document.getElementById('inputName').value;
        GRAPH.addNode(name);
    } else {
        let weight = parseFloat(document.getElementById('inputWeight').value);
        let from = document.getElementById('fromNode').value;
        let to = document.getElementById('toNode').value;
        GRAPH.addEdge(from, to, weight);
    }

    printSteps()
    GRAPH.render();
    closeModal();
}

function loadData() {
    let from = document.getElementById('fromNode');
    let to = document.getElementById('toNode');

    from.innerHTML = "";
    to.innerHTML = "";
    GRAPH.getNodes().map(node => {
        let el = document.createElement('option')
        el.innerText = node.name;
        el.value = node.id;
        from.appendChild(el);
        to.appendChild(el.cloneNode(true));
    })
}


async function select(elem, step) {
    let toolbar = document.querySelector('.toolbar');

    if (elem.id === "before") {
        toolbar.classList.remove('hidden');
    } else
        toolbar.classList.add('hidden');

    for (let elem of document.getElementsByClassName('graph-state-button'))
        elem.classList.remove('selected');
    elem.classList.add('selected');

    if (step) {
        const graph = new Graph(GRAPH.getNodes(), GRAPH.getEdges());
        console.log(graph.getNodes(), graph.getEdges());
        (await prim(step)).map(edge => graph.addEdge(edge.from, edge.to, edge.weight, "#b83434"));
        const canvas = document.getElementById('draw');
        graph.setContext(canvas.getContext("2d"))
        graph.render();
    } else {
        GRAPH.render()
    }
}

async function prim(edges) {
    let response = await fetch("http://localhost:5000/prim", {
        method: "POST",
        "headers": {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            tree: edges.map(item => ({
                node_reference: item.from,
                node_adjacent: item.to,
                cost: item.weight
            }))
        })
    })

    return (await response.json()).response.map(([from, to, weight]) => ({from, to, weight: weight.weight}));
}

async function printSteps() {
    const steps = await GRAPH.getSteps()
    const stepsElem = document.getElementById('steps');

    stepsElem.innerHTML = '';
    for (let i = 0; i < steps.length; i++) {
        let step = steps[i];

        let button = document.createElement('button');
        button.className = 'graph-state-button';
        button.onclick = () => {
            select(button, step);
        };
        button.innerHTML = i + 1;

        stepsElem.appendChild(button);
    }
}