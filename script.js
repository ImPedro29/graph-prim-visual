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
        x: 450,
        y: 900,
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
    constructor(nodes, edges, ctx) {
        this.nodes = nodes;
        this.edges = edges;
        this.ctx = ctx;
    }
    render() {
        for (let edge of this.edges)
            this.renderEdge(edge);
        for (let node of this.nodes)
            this.renderNode(node);
    }
    renderEdge({from, to}) {
        let fromNode = this.nodes.find(node => node.id === from);
        let toNode = this.nodes.find(node => node.id === to);

        this.ctx.beginPath();
        let {ctx} = this;
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#5b90cd';
        ctx.stroke();
        this.ctx.closePath();
    }
    renderNode({x, y}) {
        this.ctx.beginPath();
        let {ctx} = this;
        ctx.arc(x, y, 40, 0, 2 * Math.PI);
        ctx.strokeStyle = 'white';
        ctx.stroke();
        ctx.fill()
        this.ctx.closePath();

    }
    getNodes(){
        return this.nodes;
    }
    getEdges(){
        return this.edges;
    }
    registerClickEvents(){

    }
    getNeighbors(id) { // Pegar adjacentes (visinhos)
        return this.edges.filter(edge => edge.from === id);
    }
}

window.onload = () => {
    canvasSetRelativeSize();
    const canvas = document.getElementById('draw');
    const graph = new Graph(nodes, edges, canvas.getContext("2d"))

    // console.log(graph.getNeighbors(1)) // pegar visinhos

    graph.render();

    //Events
    document.getElementById('modalCloser').addEventListener('click', closeModal);
    document.getElementById('add').addEventListener('click', openAddModal);
}

// window.addEventListener('resize', canvasSetRelativeSize);

function openAddModal(){
    let content = document.createElement('div');
    content.classList.add('popup');

    let inputs = new Array(2).fill(0).map(() => [document.createElement('label'), document.createElement('input')]);
    let [name, weight] = inputs;

    let selects = new Array(3).fill(0).map(() => [document.createElement('label'), document.createElement('select')]);
    let [type, from, to] = selects;

    name[0].innerHTML = 'Digite o nome';
    type[0].innerHTML = 'Digite o tipo';
    from[0].innerHTML = 'Digite o partida';
    to[0].innerHTML = 'Digite o destino';
    weight[0].innerHTML = 'Digite o peso';

    for (let input of inputs)
        for (let doc of input)
            content.appendChild(doc);

    for (let input of selects)
        for (let doc of input)
            content.appendChild(doc);

    openModal(content);
}

function canvasSetRelativeSize(){
    let width = window.innerWidth;
    let height = window.innerHeight;

    const canvas = document.getElementById('draw');
    canvas.setAttribute('width', width);
    canvas.setAttribute('height', height);
}
function closeModal(){
    document.getElementById('modal').classList.add('hidden');
}
function openModal(content){ // Content should be a document
    let modal = document.getElementById('modal');
    modal.classList.remove('hidden');
    modal.appendChild(content);

}

