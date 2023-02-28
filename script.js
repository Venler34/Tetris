// rows = 20, columns = 10

window.addEventListener('load', function() {
    canvas = document.getElementById("canvas1");
    ctx = canvas.getContext('2d');
    canvas.width = 500;
    canvas.height = 1000;
    rows = 20;
    cols = 10;
    class InputHandler {
        constructor(game) {
            this.game = game;
            window.addEventListener("keydown", e => {
                if(e.key === "a" && !game.keys.includes("a")) {
                    game.keys.push("a")
                } else if(e.key === "d" && !game.keys.includes("d")) {
                    game.keys.push("d")
                } else if (e.key === "r") {
                    game.rotate(90);
                } else if (e.key === "e") {
                    game.rotate(-90);
                }
            })
            window.addEventListener("keyup", e => {
                const index = game.keys.indexOf(e.key)
                if(index > -1) {
                    game.keys.splice(index, 1);
                }
            })
        }
    }
    class Block {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
        updateY() {
            this.y += 1;
        }
        updateX(speedX) {
            this.x += speedX;
        }
        canUpdateX(speedX, board, backgroundColor) {
            if(this.x + speedX >= cols || this.x + speedX < 0){
                return false;
            }
            else if(board[this.y][this.x + speedX] != backgroundColor){
                return false;
            }
            return true;
        }
        canUpdateY(board, backgroundColor) {
            if(this.y + 1 >= rows){
                return false;
            }
            else if(board[this.y+1][this.x] != backgroundColor){
                return false;
            }
            return true;
        }
        convertDegreesToRadians(degrees) {
            return degrees * Math.PI / 180;
        }
        canRotate(degrees, row, col, board, backgroundColor) {
            let radians = this.convertDegreesToRadians(degrees);
            let c = Math.round(Math.cos(radians));
            let s = Math.round(Math.sin(radians));
            let xOrigin = this.x - col;
            let yOrigin = this.y - row;

            console.log(c + " " + s);

            let xCord = (xOrigin * c - yOrigin * s) + col;
            let yCord = (xOrigin * s + yOrigin * c) + row;

        
            if(yCord >= rows || yCord < 0 || xCord >= cols || xCord < 0){
                console.log(xCord + " " + yCord);
                return false;
            }
            if(board[yCord][xCord] != backgroundColor) {
                return false;
            }
            return true;
        }
        rotate(degrees, row, col) {
            let radians = this.convertDegreesToRadians(degrees);
            //subtract the pivot
            this.x -= col;
            this.y -= row;

            let tempX = Math.round(this.x * Math.cos(radians) - this.y * Math.sin(radians))
            this.y = Math.round(this.x * Math.sin(radians) + this.y * Math.cos(radians))
            this.x = tempX;

            //add the pivot
            this.x += col;
            this.y += row;
        }
        printCords() {
            console.log("(" + this.x + "," + this.y + ")");
        }
    }
    class Tetromino {
        constructor(game) {
            this.game = game;
            this.speedX = 0;
            this.maxSpeed = 1;
            this.markedForDeletion = false;
        }
        update() {
            if(this.game.keys.includes("a")) {
                this.speedX = -this.maxSpeed;
            } else if (this.game.keys.includes("d")) {
                this.speedX = this.maxSpeed;
            } else {
                this.speedX = 0;
            }

            const board = this.removeCords(this.game.board);
            const backgroundColor = this.game.backgroundColor;
            

            //checks if can update x and then updates it

            let canUpdateX = true;
            this.blocks.forEach(block => {
                canUpdateX = canUpdateX && block.canUpdateX(this.speedX, board, backgroundColor);
            });
            if(canUpdateX){
                this.blocks.forEach(block => { 
                    block.updateX(this.speedX);
                })
            }

            //checks if can update y and then updates it

            let canUpdateY = true;
            this.blocks.forEach(block => {
                canUpdateY = canUpdateY && block.canUpdateY(board, backgroundColor);
            });
            if(canUpdateY){
                this.blocks.forEach(block => { 
                    block.updateY();
                })
            }

            return canUpdateY;
        }
        removeCords(board) {
            this.blocks.forEach(block => { 
                board[block.y][block.x] = this.game.backgroundColor;
            })
            return board;
        }
        getBlocks() {
            return this.blocks;
        }
        rotate(degrees) {
            this.removeCords(this.game.board);
            let pivot = this.getPivot();
            let canRotate = true;
            this.blocks.forEach(block => {
                canRotate = canRotate && block.canRotate(degrees, pivot.y, pivot.x, this.game.board, this.game.backgroundColor);
            })

            if(canRotate) {
                this.blocks.forEach(block => {
                    block.rotate(degrees, pivot.y, pivot.x);
                })
            }
        }
        getPivot() {
            return this.pivot;
        }
    }
    class Straight extends Tetromino{
        constructor(game, color){
            super(game);
            this.blocks = [];
            this.length = 4;
            this.color = color;
            let start = (cols - this.length) / 2;
            for(let i = start; i < start + this.length; i++) {
                const xCord = i;
                const yCord = 0; //top of tetris board
                this.blocks.push(new Block(xCord, yCord));
            }
            this.pivot = this.blocks[1];
        }
    }
    class Square extends Tetromino {
        constructor(game, color) {
            super(game);
            this.blocks = [];
            this.length = 2;
            this.color = color;
            let start = (cols - this.length) / 2;
            for(let row = 0; row < this.length; row++){
                for(let col = start; col < start + this.length; col++){
                    const xCord = col;
                    const yCord = row;
                    this.blocks.push(new Block(xCord,yCord));
                }
            }
            this.pivot = this.blocks[1];
        }
    }
    class Right_Skew extends Tetromino{
        constructor(game, color) {
            super(game);
            this.blocks = [];
            this.length = 3;
            this.color = color;
            let start = parseInt((cols - this.length) / 2,10);
            
            this.blocks.push(new Block(start, 1));
            this.blocks.push(new Block(start+1, 0));
            this.blocks.push(new Block(start+1, 1));
            this.blocks.push(new Block(start+2, 0));

            this.pivot = this.blocks[1];
        }
    }
    class Left_Skew extends Tetromino {
        constructor(game, color) {
            super(game);
            this.blocks = [];
            this.length = 3;
            this.color = color;
            let start = parseInt((cols - this.length) / 2,10);
            
            this.blocks.push(new Block(start, 0));
            this.blocks.push(new Block(start+1, 0));
            this.blocks.push(new Block(start+1, 1));
            this.blocks.push(new Block(start+2, 1));

            this.pivot = this.blocks[1];
        }
    }
    class L extends Tetromino{
        constructor(game, color) {
            super(game);
            this.blocks = [];
            this.length = 3;
            this.color = color;
            let start = parseInt((cols - this.length) / 2,10);
            
            this.blocks.push(new Block(start, 1));
            this.blocks.push(new Block(start+1, 1));
            this.blocks.push(new Block(start+2, 1));
            this.blocks.push(new Block(start+2, 0));

            this.pivot = this.blocks[1];
        }
    }
    class Reverse_L extends Tetromino {
        constructor(game, color) {
            super(game);
            this.blocks = [];
            this.length = 3;
            this.color = color;
            let start = parseInt((cols - this.length) / 2,10);
            
            this.blocks.push(new Block(start, 0));
            this.blocks.push(new Block(start+1, 0));
            this.blocks.push(new Block(start+2, 0));
            this.blocks.push(new Block(start+2, 1));

            this.pivot = this.blocks[1];
        }
    }
    class T extends Tetromino{
        constructor(game, color) {
            super(game);
            this.blocks = [];
            this.length = 3;
            this.color = color;
            let start = parseInt((cols - this.length) / 2,10);
            
            this.blocks.push(new Block(start, 1));
            this.blocks.push(new Block(start+1, 1));
            this.blocks.push(new Block(start+1, 0));
            this.blocks.push(new Block(start+2, 1));

            this.pivot = this.blocks[1];
        }
    }
    class UI {
        constructor(game) {
            this.game = game;
        }
        draw(context) {
            if(!this.game.gameOver)
            {
                context.font = '30px Helvetica';
                context.fillStyle = 'white'
                context.fillText("Score: " + this.game.score, 0, 40);
            }
            else {
                context.font = "50px Helvetica";
                context.fillStyle = 'white';
                context.fillText("You scored: " + this.game.score, 80, canvas.height/2);
            }
        }
    }
    class Game {
        constructor() {
            this.inputHandler = new InputHandler(this);
            this.ui = new UI(this);
            this.blocks = ["Straight","Square","Right_Skew","Left_Skew", "L", "Reverse_L", "T"];
            this.needNewBlock = true;
            this.dropTime = 100;
            this.currentTime = 0;
            this.keys = [];
            this.board = [];
            this.backgroundColor = 'black';
            this.blockLength = canvas.height / rows;
            this.score = 0;
            this.gameOver = false;
            for(let row = 0; row < rows; row++){
                let currRow = [];
                for(let col = 0; col < cols; col++){
                    currRow.push(this.backgroundColor);
                }
                this.board.push(currRow);
            }
        }
        getBlock() {
            let blockNum = parseInt(Math.random() * this.blocks.length, 10);
            if(this.blocks[blockNum] === "Straight") {
                return new Straight(this, 'blue')

            } else if(this.blocks[blockNum] === "Square") {
                return new Square(this, 'yellow')

            } else if(this.blocks[blockNum] === "Right_Skew") {
                return new Right_Skew(this, 'red');

            } else if(this.blocks[blockNum] === "Left_Skew") {
                return new Left_Skew(this, 'green');
            } else if(this.blocks[blockNum] === "L") {
                return new L(this, 'blue');
            } else if (this.blocks[blockNum] === "Reverse_L") {
                return new Reverse_L(this, 'orange');
            }else if(this.blocks[blockNum] === "T") {
                return new T(this, 'purple');
            }
        }
        createBlock() {
            if(!this.gameOver) {
                this.block = this.getBlock();
                this.checkGameOver();
            }
        }
        update(deltaTime) {
            if(!this.gameOver) {
                if(this.currentTime >= this.dropTime){
                    if(this.needNewBlock) {
                        this.createBlock();
                        this.needNewBlock = false;
                    } else {
                        this.updateBoard();
                    }
                    this.currentTime = 0;
                } else {
                    this.currentTime += deltaTime;
                }
            }
        }
        updateBoard() {
            this.needNewBlock = !this.block.update();

            //update board. The block was removed previously
            const blocks = this.block.getBlocks();
            blocks.forEach(block => {
                this.board[block.y][block.x] = this.block.color;
            })

            if(this.needNewBlock)
            {
                this.deleteRows(); //delete any rows that are complete
            }
        }
        deleteRows(){
            //find rows to delete
            let rowToRemove = [];
            for(let rowToCheck = rows-1; rowToCheck >= 0; rowToCheck--) {
                if(this.shouldRemoveRow(rowToCheck)) {
                    rowToRemove.push(rowToCheck);
                }
            }

            this.score += Math.pow(10, rowToRemove.length);

            //delete rows
            for(let rowRemove = 0; rowRemove < rowToRemove.length; rowRemove++){
                let rowNum = rowToRemove[rowRemove] + rowRemove;
                for(let row = rowNum; row > 0; row--) {
                    for(let col = 0; col < cols; col++) {
                        this.board[row][col] = this.board[row-1][col];
                    }
                }
            }
        }
        checkGameOver() {
            let blocks = this.block.getBlocks();
            let gameOver = false;
            blocks.forEach(block => {
                if(this.board[block.y][block.x] != this.backgroundColor) {
                    gameOver = true;
                }
            })
            this.gameOver = gameOver;
        }
        shouldRemoveRow(row) {
            for(let col = 0; col < cols; col++) {
                if(this.board[row][col] === this.backgroundColor){
                    return false;
                }
            }
            return true;
        }
        rotate(degrees) {
            if(!this.needNewBlock){
                this.block.rotate(degrees);
            }
        }
        draw(context) {
            for(let row = 0; row < rows; row++){
                for(let col = 0; col < cols; col++){
                    const color = this.board[row][col];
                    context.fillStyle = color;
                    context.fillRect(col * this.blockLength, row * this.blockLength, this.blockLength-1, this.blockLength-1);
                }
            }
            this.ui.draw(context);
        }
    }
    const game = new Game();
    let lastTime = 0;
    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0,0,canvas.width,canvas.height);
        game.update(deltaTime);
        game.draw(ctx);
        requestAnimationFrame(animate);
    }
    animate(0);
})