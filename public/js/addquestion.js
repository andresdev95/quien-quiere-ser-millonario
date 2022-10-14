const preguntaDefault = { level: [1], answer: 1};
Vue.component('vue-multiselect', window.VueMultiselect.default)
new Vue({
    el: '#app',
    data: {
        pregunta: structuredClone(preguntaDefault),
        levels: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20],
        bloquearBoton: false,
        mensaje: '',
        preguntas: [],
    },
    methods: {
        save(){
            this.mensaje = '';
            this.bloquearBoton = true;
            axios.post('question', this.pregunta).then(response => {
                this.addPregunta(response.data);
                this.mensaje = 'Pregunta modificada/guardada con exito "'+response.data._id+'"';
                this.pregunta = structuredClone(preguntaDefault);
            }).catch(error => {
                console.log(error);
            }).then(()=>{ this.bloquearBoton = false; });
        },
        getPreguntas(){
            axios.get('questions').then(response => {
                this.preguntas = response.data;
            }).catch(error => {
                console.log(error);
            }).then(()=>{});
        },
        editarPregunta(pregunta){
            this.pregunta = pregunta;
        },
        addPregunta(pregunta){
            let i = this.preguntas.findIndex(x => x._id == pregunta._id)
            if( i === -1 ){ this.preguntas.push(pregunta); }
            else { this.preguntas.splice(i, 1, pregunta) }
                console.log(pregunta)
        },
    },
    created: function(){
        this.getPreguntas();
    }
});
