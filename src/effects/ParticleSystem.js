// src/effects/ParticleSystem.js

class Particle {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type; 
        this.alpha = 1;
        this.life = 1.0; 

        if (type === 'fire') {
            this.decay = Math.random() * 0.005 + 0.004; // 💡 活得更久（更明顯）
            this.size = Math.random() * 30 + 25;        // 💡 體積變大（超有存在感）
            this.vx = (Math.random() - 0.5) * 1.5;
            this.vy = -Math.random() * 2.5 - 1.5; 
        } else if (type === 'bubble') {
            this.decay = Math.random() * 0.004 + 0.003; // 💡 泡泡可以悠閒地在背景飄很久
            this.size = Math.random() * 28 + 20;        // 💡 泡泡變大顆
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = -Math.random() * 1.0 - 0.6; 
            this.wobbleSpeed = Math.random() * 0.03 + 0.01;
            this.wobbleDistance = Math.random() * 1.5 + 0.5;
            this.wobbleCount = Math.random() * 100;
        } else if (type === 'ambient') {
            this.decay = Math.random() * 0.01 + 0.005;
            this.size = Math.random() * 14 + 10;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = Math.random() * 0.5 + 0.4;
        } else {
            // 點擊觸發的粒子
            this.decay = Math.random() * 0.03 + 0.02; 
            this.size = Math.random() * 26 + 20;
            this.vx = (Math.random() - 0.5) * 5;
            this.vy = (Math.random() - 0.5) * 5;
        }
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.type === 'bubble') {
            this.wobbleCount += this.wobbleSpeed;
            this.x += Math.sin(this.wobbleCount) * this.wobbleDistance * 0.3; 
        }

        if (this.type === 'fire') {
            this.vx *= 0.98;
            this.vy *= 0.98;
        }

        this.life -= this.decay;
        this.alpha = Math.max(0, this.life);
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        
        // 💡 效能優化：使用精簡的系統字體，大幅減少 Canvas 的渲染卡頓
        ctx.font = `${Math.floor(this.size)}px sans-serif`;

        let char = '✨';
        if (this.type === 'paw') char = '🐾';
        if (this.type === 'heart') char = '❤️';
        if (this.type === 'bubble') char = '🫧';
        if (this.type === 'fire') char = '🔥';
        if (this.type === 'ambient') char = '✨';

        ctx.fillText(char, this.x, this.y);
        ctx.restore();
    }
}

export class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
    }

    emit(x, y, type, count = 1) {
        // 💡 嚴格限制畫面最大粒子數為 150，只要超過，新背景粒子一律不產生，完美保障流暢度
        if (this.particles.length > 150 && (type === 'fire' || type === 'bubble' || type === 'ambient')) {
            return;
        }

        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, type));
        }
    }

    update() {
        let aliveIndex = 0;
        const len = this.particles.length;

        for (let i = 0; i < len; i++) {
            this.particles[i].update();
            if (this.particles[i].life > 0) {
                this.particles[aliveIndex] = this.particles[i];
                aliveIndex++;
            }
        }
        this.particles.length = aliveIndex;
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.textBaseline = 'middle';
        this.ctx.textAlign = 'center';

        const len = this.particles.length;
        for (let i = 0; i < len; i++) {
            this.particles[i].draw(this.ctx);
        }
    }
}