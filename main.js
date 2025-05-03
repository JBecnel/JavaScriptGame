import { Player } from './player.js';
import { InputHandler } from './input.js';
import { Background } from './background.js';
import { FlyingEnemy, GroundEnemy, ClimbingEnemy } from './enemies.js';
import { UI } from './ui.js';
window.addEventListener("load", function(){
    const canvas = document.getElementById("canvas1");
    const ctx = canvas.getContext('2d');
    canvas.width = 900;
    canvas.height = 500;

    class Game {
        constructor(width, height) {
            this.width = width;
            this.height = height;
            this.groundMargin = 50;
            this.background = new Background(this);
            this.player = new Player(this);
            this.input = new InputHandler(this);
            this.UI = new UI(this);
            this.particles = [];
            this.speed = 0;
            this.maxSpeed = 6;
            this.maxParticles =50;
            this.enemies = [];
            this.collisions = [];
            this.enemyTimer = 0;
            this.enemyInterval = 1000;
            this.debug = false;
            this.score = 0;
            this.winningScore = 40;
            this.fontColor = 'black';
            this.player.currentState = this.player.states[0];
            this.player.currentState.enter();
            this.time = 0;
            this.maxTime = 30000;
            this.gameOver = false; 
            this.lives = 5;
            this.floatingMessages = [];
        }
        update(deltaTime) {
            this.time += deltaTime;
            if (this.time > this.maxTime)
                this.gameOver = true;
            
            this.background.update();
            this.player.update(this.input.keys, deltaTime);

            if (this.enemyTimer > this.enemyInterval) {
                this.addEnemy();
                this.enemyTimer = 0;
            } else{
                this.enemyTimer += deltaTime;
            }
            this.enemies.forEach(enemy => {
                enemy.update(deltaTime);                
            });

            this.particles.forEach((p, index) => {
                p.update();
                //if (p.markedForDeletion)
                  //  this.particles.splice(index, 1);
            });

            this.floatingMessages.forEach(message => {
                message.update();
            });

            if (this.particles.length > this.maxParticles) {
               // this.particles.splice(0, this.maxParticles);
               this.particles.length = this.maxParticles;
            }
            //console.log(this.particles);
            this.collisions.forEach((collision, index) => {
                collision.update(deltaTime);
                //if (collision.markedForDeletion)
                  //  this.collisions.splice(index, 1);
            });
            this.floatingMessages = this.floatingMessages.filter(message => !message.markedForDeletion);   
            this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion);
            this.collisions = this.collisions.filter(c => !c.markedForDeletion);
            this.particles = this.particles.filter(p => !p.markedForDeletion);
        }

        draw(context) {
            this.background.draw(context);
            this.player.draw(context);
            this.enemies.forEach(enemy => {
                enemy.draw(context);
            });

            this.particles.forEach(p => {
                p.draw(context);
            });


            this.floatingMessages.forEach(message => {
                message.draw(context);
            })

            this.collisions.forEach(col => {
                col.draw(context);
            });
            this.UI.draw(context);
        }

        addEnemy() {
            if (this.speed > 0 && Math.random() < 0.5)
                this.enemies.push(new GroundEnemy(this));
            else if (this.speed > 0)
                this.enemies.push(new ClimbingEnemy(this));

            this.enemies.push(new FlyingEnemy(this));
            
        }
    }
    const game = new Game(canvas.width, canvas.height);
    
    let lastTime = 0;

    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0,0, canvas.width, canvas.height);
        game.update(deltaTime);
        game.draw(ctx);
        if (!game.gameOver)
            requestAnimationFrame(animate)
    }
    animate(0);
})