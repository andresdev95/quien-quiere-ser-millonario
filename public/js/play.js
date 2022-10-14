const buttons = {
    lock: document.getElementById('lock-button'),
    quit: document.getElementById('quit-button')
};
const TIEMPO_ESPERA_PREGUNTA = 2000;
const app = new Vue({
    el: '#app',
    data: {
        pregunta: {},
        nivel_maximo: 20,
        opcionSeleccionada: 0,
        dialogoSalir: 0,
        niveles: [
            {id: 1, nombre: 'Nivel 1', seguro: 0, completado: 0},
            {id: 2, nombre: 'Nivel 2', seguro: 0, completado: 0},
            {id: 3, nombre: 'Nivel 3', seguro: 0, completado: 0},
            {id: 4, nombre: 'Nivel 4', seguro: 0, completado: 0},
            {id: 5, nombre: 'Nivel 5', seguro: 1, completado: 0},
            {id: 6, nombre: 'Nivel 6', seguro: 0, completado: 0},
            {id: 7, nombre: 'Nivel 7', seguro: 0, completado: 0},
            {id: 8, nombre: 'Nivel 8', seguro: 0, completado: 0},
            {id: 9, nombre: 'Nivel 9', seguro: 0, completado: 0},
            {id: 10, nombre: 'Nivel 10', seguro: 1, completado: 0},
            {id: 11, nombre: 'Nivel 11', seguro: 0, completado: 0},
            {id: 12, nombre: 'Nivel 12', seguro: 0, completado: 0},
            {id: 13, nombre: 'Nivel 13', seguro: 0, completado: 0},
            {id: 14, nombre: 'Nivel 14', seguro: 0, completado: 0},
            {id: 15, nombre: 'Nivel 15', seguro: 1, completado: 0},
            {id: 16, nombre: 'Nivel 16', seguro: 0, completado: 0},
            {id: 17, nombre: 'Nivel 17', seguro: 0, completado: 0},
            {id: 18, nombre: 'Nivel 18', seguro: 0, completado: 0},
            {id: 19, nombre: 'Nivel 19', seguro: 0, completado: 0},
            {id: 20, nombre: 'Nivel 20', seguro: 1, completado: 0},
        ],
        usuario: null,
        juegoEnProgreso: 1,
        mensaje: ''
    },
    methods: {
        init(){
            this.usuario = {
                nivel_max: 0,
                nivel_actual: 0,
                nivel_seguro: 0,
                tiempo: 0,
                nombre: 'Usuario',
                _id: '1',
            }
            this.iniciarTiempoTotal();
            this.siguientePregunta();
        },
        nivelesPanel(){
            return structuredClone(this.niveles).reverse();
        },
        iniciarTiempoTotal(){
            setTimeout(() => {
                if(this.juegoEnProgreso == 1){
                    this.usuario.tiempo++;
                    this.iniciarTiempoTotal();
                }
            }, 1000);
        },
        detenerTiempoTotal(){
            this.juegoEnProgreso = 0;
        },
        getUltimoNivel(){
            return this.usuario.nivel_actual;
        },
        getUltimoNivelSeguro(){
            const nivel = this.nivelesPanel().filter((a)=> a.completado && a.seguro)[0];
            if(nivel) return nivel.id;
            return 0;
        },
        prepararSiguienteNivel(){
            this.opcionSeleccionada = 0;
            document.querySelectorAll('.answer').forEach(label => {
                label.classList.remove('ok');
                label.classList.remove('fail');
            });
            this.pregunta = {};
            unlockActions();
            this.mostrarMensaje('');
            this.cambiarNivelActual(this.getUltimoNivel() + 1);
        },
        siguientePregunta(){
            this.prepararSiguienteNivel();
            axios.get('api/question/'+this.usuario.nivel_actual).then((response)=>{
                this.pregunta = response.data;
                setTimer(45);
                startResumeTimer()
            }).catch((error)=>{
                console.error(error);
            });
        },
        respuestaEsCorrecta(){
            return this.opcionSeleccionada == this.pregunta.answer;
        },
        comprobarRespuesta(){
            pauseTimer();
            lockActions();
            this.mostrarInformacionRespuestas();

            if(this.respuestaEsCorrecta()){
                this.marcarNivelComoCompleto();    
                this.comprobarNivelMaximo();
                if(this.usuario.nivel_actual >= this.nivel_maximo ) this.terminarJuego();
                else setTimeout(()=>{ this.siguientePregunta() }, TIEMPO_ESPERA_PREGUNTA);
            }else{
                this.irAUltimoSeguro();
            }
        },
        mostrarInformacionRespuestas(){
            const selectedAnswerLabel = document.getElementById(`option${this.opcionSeleccionada}`);
            if(this.respuestaEsCorrecta()){
                selectedAnswerLabel.classList.add("ok");
                this.mostrarMensaje('Excelente, Siguiente nivel');
            }else{
                if(this.opcionSeleccionada){ selectedAnswerLabel.classList.add("fail"); }
                const correctAnswerLabel = document.getElementById(`option${this.pregunta.answer}` );
                correctAnswerLabel.classList.add("ok");
                this.mostrarMensaje('Oh no, retrocedes al ultimo seguro');
            }
        },
        cambiarNivelActual(nivel){
            this.usuario.nivel_actual = nivel;
        },
        comprobarNivelMaximo(nivel){
            if(this.usuario.nivel_max < this.usuario.nivel_actual){
                this.usuario.nivel_max = this.usuario.nivel_actual;
            }
        },
        irAUltimoSeguro(){
            this.cambiarNivelActual(this.getUltimoNivelSeguro());
            this.marcarNivelComoCompleto();
            setTimeout(()=>{ this.siguientePregunta() }, TIEMPO_ESPERA_PREGUNTA);
        },
        marcarNivelComoCompleto(){
            this.niveles.map((nivel) => {
                nivel.completado = (this.usuario.nivel_actual >= nivel.id ? 1 : 0)
            })
        },
        terminarJuego(){
            this.ocultarDialogoSalir();
            lockActions();
            pauseTimer();
            this.detenerTiempoTotal();
            this.mostrarMensaje(`Terminastes el juego - Tiempo: ${this.usuario.tiempo} Seg.`);
        },
        mostrarMensaje(mensaje){
            this.mensaje = mensaje;
        },
        mostrarDialogoSalir(){
            this.dialogoSalir = 1;
        },
        ocultarDialogoSalir(){
            this.dialogoSalir = 0;
        }
    },
    created: function(){
        this.init();
    }
});

function lockActions() {
    document.getElementById('lock-button').disabled = true;
    document.getElementById('quit-button').disabled = true;
}

function unlockActions(buttons) {
    document.getElementById('lock-button').disabled = false;
    document.getElementById('quit-button').disabled = false;
}


// Time Container
const timer = {
    span: document.getElementById('progress-span'),
    left: document.getElementById('progress-left'),
    right: document.getElementById('progress-right'),
    running: false,
    timeLeft: 45,
    timeTotal: 45
};

function setTimer(time) {
    timer.running = false;
    if (time) {
        // Time is either 45 or 60 seconds
        timer.span.innerHTML = time;
        timer.timeLeft = time;
        timer.timeTotal = time;
        timer.left.style.width = '0%';
        timer.right.style.width = '0%';
    } else {
        // Time is infinity
        timer.span.innerHTML = 0;
        timer.timeLeft = 0;
        timer.timeTotal = 0;
        timer.left.style.width = '100%';
        timer.right.style.width = '100%';
    }
}

function startResumeTimer() {
    if (!timer.running) {
        // Start or Resume Timer
        timer.running = true;
        decrementTimer(timer.timeLeft);
    }
}

function pauseTimer() {
    if (timer.running) {
        // Pause Timer
        timer.running = false;
    }
}

function decrementTimer() {
    if (timer.running) {
        setTimeout(() => {
            if (timer.timeLeft >= 1) {
                timer.timeLeft--;
                let progress =
                    100 - Math.floor((timer.timeLeft / timer.timeTotal) * 100);
                timer.left.style.width = progress + '%';
                timer.right.style.width = progress + '%';
                timer.span.innerHTML = timer.timeLeft;
                decrementTimer();
            } else {
                app.comprobarRespuesta();
            }
        }, 1000);
    }
}
