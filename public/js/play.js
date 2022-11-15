const buttons = {
    lock: document.getElementById('lock-button'),
    quit: document.getElementById('quit-button')
};
const TIEMPO_ESPERA_SIGUIENTE_PREGUNTA = 2000; // IN MiliSeconds
const TIEMPO_RESPONDER_PREGUNTA = 60; // IN Seconds.
//const socket = io();
//socket.emit('savedGame', {nombre: 'queso'});
const app = new Vue({
    el: '#app',
    data: {
        pregunta: {},
        nivel_maximo: 20,
        opcionSeleccionada: 0,
        dialogoSalir: 0,
        niveles: [
            {id: 1, nombre: 'Pregunta 1', seguro: 0, completado: 0},
            {id: 2, nombre: 'Pregunta 2', seguro: 0, completado: 0},
            {id: 3, nombre: 'Pregunta 3', seguro: 0, completado: 0},
            {id: 4, nombre: 'Pregunta 4', seguro: 0, completado: 0},
            {id: 5, nombre: 'Pregunta 5', seguro: 1, completado: 0},
            {id: 6, nombre: 'Pregunta 6', seguro: 0, completado: 0},
            {id: 7, nombre: 'Pregunta 7', seguro: 0, completado: 0},
            {id: 8, nombre: 'Pregunta 8', seguro: 0, completado: 0},
            {id: 9, nombre: 'Pregunta 9', seguro: 0, completado: 0},
            {id: 10, nombre: 'Pregunta 10', seguro: 1, completado: 0},
            {id: 11, nombre: 'Pregunta 11', seguro: 0, completado: 0},
            {id: 12, nombre: 'Pregunta 12', seguro: 0, completado: 0},
            {id: 13, nombre: 'Pregunta 13', seguro: 0, completado: 0},
            {id: 14, nombre: 'Pregunta 14', seguro: 0, completado: 0},
            {id: 15, nombre: 'Pregunta 15', seguro: 1, completado: 0},
            {id: 16, nombre: 'Pregunta 16', seguro: 0, completado: 0},
            {id: 17, nombre: 'Pregunta 17', seguro: 0, completado: 0},
            {id: 18, nombre: 'Pregunta 18', seguro: 0, completado: 0},
            {id: 19, nombre: 'Pregunta 19', seguro: 0, completado: 0},
            {id: 20, nombre: 'Pregunta 20', seguro: 1, completado: 0},
        ],
        usuario: null,
        juegoEnProgreso: 1,
        mensaje: ''
    },
    methods: {
        init(){
            if((!localStorage._id) || (localStorage.finalizado == 1)) window.location.href = '/';
            this.userFromStorage();
            this.iniciarTiempoTotal();
            this.siguientePregunta();
            //socket.emit('savedGame', this.usuario);
        },
        userFromStorage(){
            this.usuario = {
                finalizado: 0, //parseInt(localStorage.finalizado)
                nivel_maximo: 0, //parseInt(localStorage.nivel_maximo),
                nivel_actual: 0, //parseInt(localStorage.nivel_actual),
                nivel_seguro: 0, //parseInt(localStorage.nivel_seguro),
                tiempo: 0, //parseInt(localStorage.tiempo),
                usuario: localStorage.usuario,
                _id: localStorage._id,
            };
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
                setTimer(this.pregunta.time || TIEMPO_RESPONDER_PREGUNTA);
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
            this.saveToStorage(this.usuario);

            if(this.respuestaEsCorrecta()){
                this.marcarNivelComoCompleto();    
                this.comprobarNivelMaximo();
                if(this.usuario.nivel_actual >= this.nivel_maximo ) this.terminarJuego();
                else setTimeout(()=>{ this.siguientePregunta() }, TIEMPO_ESPERA_SIGUIENTE_PREGUNTA);
            }else{
                this.irAUltimoSeguro();
            }
            this.saveData();
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
            if(this.usuario.nivel_maximo < this.usuario.nivel_actual){
                this.usuario.nivel_maximo = this.usuario.nivel_actual;
            }
        },
        irAUltimoSeguro(){
            this.cambiarNivelActual(this.getUltimoNivelSeguro());
            this.marcarNivelComoCompleto();
            setTimeout(()=>{ this.siguientePregunta() }, TIEMPO_ESPERA_SIGUIENTE_PREGUNTA);
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
            this.mostrarMensaje(`<h2>Felicitaciones</h2> <br> Terminastes el juego <br> Tiempo: ${this.usuario.tiempo} Seg.`);
            this.usuario.finalizado = 1;
            this.saveData();
        },
        mostrarMensaje(mensaje){
            this.mensaje = mensaje;
        },
        mostrarDialogoSalir(){
            this.dialogoSalir = 1;
        },
        ocultarDialogoSalir(){
            this.dialogoSalir = 0;
        },
        saveToStorage(informacion){
            localStorage.finalizado = informacion.finalizado ;
            localStorage.nivel_maximo = informacion.nivel_maximo ;
            localStorage.nivel_actual = informacion.nivel_actual ;
            localStorage.nivel_seguro = informacion.nivel_seguro ;
            localStorage.tiempo = informacion.tiempo;
            localStorage.usuario = informacion.usuario;
            localStorage._id = informacion._id;
        },
        saveData(){
            let usuario = {
                _id: this.usuario._id,
                nivel_actual: this.usuario.nivel_actual,
                nivel_maximo: this.usuario.nivel_maximo,
                finalizado: this.usuario.finalizado,
                tiempo: this.usuario.tiempo
            };
            axios.post('play/save', usuario).then((response)=>{
                //console.log(response.data)
                //socket.emit('savedGame',this.usuario);
            }).catch((error)=>{
                console.error(error);
            });
        }
    },
    created: function(){
        this.init();
    },
    watch: {
        usuario(newUsuario) {
            this.saveToStorage(newUsuario);
        }
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
