let nodes = [
    {
        x: 100,
        y: 200,
        id: 1,
        name: "Piru",
    },
    {
        x: 150,
        y: 400,
        id: 2,
        name: "Pussy",
    },
    {
        x: 650,
        y: 300,
        id: 3,
        name: "Banana",
    },
    {
        x: 450,
        y: 800,
        id: 4,
        name: "Jaca",
    },
    {
        x: 190,
        y: 600,
        id: 5,
        name: "Jumento",
    }
];

let edges = [
    {
        from: 1,
        to: 2,
        weight: 3 // peso
    },
    {
        from: 2,
        to: 3,
        weight: 2 // peso
    },
    {
        from: 1,
        to: 3,
        weight: 4 // peso
    }
];

class Graph {
    constructor(nodes, edges) {
        this.nodes = nodes;
        this.edges = edges;
        do {
            this.nextId = 0;
        } while (nodes.find(item => item.id === this.nextId))
        {
            this.nextId++;
        }
    }

    setContext(ctx) {
        this.ctx = ctx;
    }

    render() {
        for (let edge of this.edges)
            this.renderEdge(edge);
        for (let node of this.nodes)
            this.renderNode(node);
    }

    renderEdge({from, to, weight}) {
        let fromNode = this.nodes.find(node => node.id === from);
        let toNode = this.nodes.find(node => node.id === to);

        this.ctx.beginPath();
        let {ctx} = this;
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        ctx.lineWidth = weight;
        ctx.strokeStyle = '#333';
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

    addEdge(from, to, weight) {
        from = parseInt(from)
        to = parseInt(to)
        weight = parseInt(weight)
        this.edges.push({
            from,
            to,
            weight
        })
    }

    registerClickEvents() {

    }

    getNeighbors(id) { // Pegar adjacentes (visinhos)
        return this.edges.filter(edge => edge.from === id);
    }
}

const graph = new Graph(nodes, edges)

window.onload = () => {
    canvasSetRelativeSize();
    const canvas = document.getElementById('draw');
    graph.setContext(canvas.getContext("2d"))
    graph.render();

    //load
    loadData()

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
        graph.addNode(name);
    } else {
        let weight = parseFloat(document.getElementById('inputWeight').value);
        let from = document.getElementById('fromNode').value;
        let to = document.getElementById('toNode').value;
        graph.addEdge(from, to, weight);
    }

    graph.render();
    closeModal();
}

function loadData() {
    let from = document.getElementById('fromNode');
    let to = document.getElementById('toNode');

    from.innerHTML = "";
    to.innerHTML = "";
    graph.getNodes().map(node => {
        let el = document.createElement('option')
        el.innerText = node.name;
        el.value = node.id;
        from.appendChild(el);
        to.appendChild(el.cloneNode(true));
    })
}


async function select(time) {
    let toolbar = document.querySelector('.toolbar');
    let after = document.getElementById('after');
    let before = document.getElementById('before');

    if (time === "after") {
        toolbar.classList.add('hidden');
        after.classList.add('selected')
        before.classList.remove('selected')

        let data = await prim()
        let afterGraph = new Graph(graph.getNodes(), data.map(([from, to]) => ({from, to, weight: 2})))
        afterGraph.setContext(document.getElementById('draw').getContext('2d'))
        afterGraph.render()
    } else if (time === "before") {
        toolbar.classList.remove('hidden');
        after.classList.remove('selected')
        before.classList.add('selected')

        graph.render()
    }
}

async function prim(){
    let response = await fetch("http://localhost:5000/prim", {
        method: "POST",
        "headers": {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            tree: graph.getEdges().map(item => ({
                node_reference: item.from,
                node_adjacent: item.to,
                cost: item.weight
            }))
        })
    })

    return (await response.json()).response;
}