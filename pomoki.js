const reloj = document.getElementById("reloj");
const fecha = document.getElementById("fecha");
const inputAgregar = document.getElementById("nueva-tarea");
const botonAgregar = document.getElementById("agregar-tarea");
const listaTareas = document.getElementById("lista-tareas");
const botonNota = document.getElementById("boton-nota");
const panelNota = document.getElementById("panel-nota");
const inputNota = document.getElementById("nueva-nota");
const botonGuardarNota = document.getElementById("guardar-nota");
const listaNotas = document.getElementById("lista-notas");
const landing = document.getElementById("landing");
const app = document.getElementById("app");
const botonEmpezar = document.getElementById("boton-empezar");
const botonesColor = document.querySelectorAll(".color");
const modalAlerta = document.getElementById("modal-alerta");
const modalCerrar = document.getElementById("modal-cerrar");
const sonidoAlerta = new Audio('audio/alerta.mp3')
const modalEditar = document.getElementById("modal-editar");
const inputEditar = document.getElementById("input-editar");
const cancelarEdicion = document.getElementById("cancelar-edicion");
const guardarEdicion = document.getElementById("guardar-edicion");
const saludo = document.getElementById("saludo");
const frase = document.getElementById("frase");
const contadorTareas = document.getElementById("contador-tareas");
const botonesPrioridad = document.querySelectorAll(".prioridad");
const modalEditarTitulo = document.getElementById("modal-editar-titulo");
const pomodoroTiempo = document.getElementById("pomodoro-tiempo");
const pomodoroIniciar = document.getElementById("pomodoro-iniciar");
const pomodoroReiniciar = document.getElementById("pomodoro-reiniciar");
const pomodoroEstado = document.getElementById("pomodoro-estado");
const modalFase = document.getElementById("modal-fase");
const modalFaseMensaje = document.getElementById("modal-fase-mensaje");
const modalFaseCerrar = document.getElementById("modal-fase-cerrar");
const pomodoroConfigAbrir = document.getElementById("pomodoro-config-abrir");
const pomodoroConfig = document.getElementById("pomodoro-config");
const configEnfoque = document.getElementById("config-enfoque");
const configDescansoCorto = document.getElementById("config-descanso-corto");
const configDescansoLargo = document.getElementById("config-descanso-largo");
const configSesiones = document.getElementById("config-sesiones");
const configGuardar = document.getElementById("config-guardar");
const pinguinoApp = document.getElementById("pinguino-app");

const frases = [
    "Un paso a la vez, pingüinita 🐧",
    "El progreso importa más que la perfección",
    "Hoy es un buen día para empezar",
    "Cada tarea completada cuenta",
    "Respira, enfócate, continúa",
    "Lo difícil de hoy es lo fácil de mañana",
    "No tienes que hacerlo todo, solo lo siguiente",
    "La vida es dura, pero mas dura la verdura"
];

const coloresPrioridad = {
    ninguna: "transparent",
    media: "#F5A623",
    alta: "#D64545"
}

const mensajesFase = {
    enfoque: "¡De vuelta a la chamba, calajo mielda!",
    descansoCorto: "¡Hora de descansar! Estírate un poco, pero no mucho aguelit@...",
    descansoLargo: "¡Te ganaste unas NALGOTAS! No cierto, mejor ve a descansar xd"
}

const imagenesPinguino = {
    inactivo: "img/inactivo.png",
    enfoque: "img/enfocado.png",
    descansoCorto: "img/durmiendo.png",
    descansoLargo: "img/durmiendo.png",
    enojado: "img/enojado.png",
};

let configPomodoro = {
    enfoque: 25,
    descansoCorto: 5,
    descansoLargo: 30,
    sesionesHastaDescansoLargo: 4
};


let tipoEdicion = "tarea";
let indiceEditando = null;
let prioridadSeleccionada = "ninguna";
let colorSeleccionado = '#F5A623';
let notas = [];
let tareas = [];
let segundosRestantes = configPomodoro.enfoque * 60;
let intervaloPomodoro = null;
let pomodoroCorriendo = false;
let faseActual = "enfoque";
let sesionesCompletadas = 0;
let temporizadorInactividad;

function empezarApp() {
    landing.style.display = "none";
    app.style.display = "block";
}

function actualizarReloj() {
    const ahora = new Date();
    const horas = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');
    const segundos = String(ahora.getSeconds()).padStart(2, '0');

    reloj.textContent = `${horas}:${minutos}:${segundos}`;

    const opciones = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    fecha.textContent = ahora.toLocaleDateString("es-ES", opciones);
}

actualizarReloj();
setInterval(actualizarReloj, 1000);

function actualizarSaludo() {
    const hora = new Date().getHours();

    if (hora < 12) {
        saludo.textContent = "Buenos dias🐧/ Good Morning🐧";
    } else if (hora < 19) {
        saludo.textContent = "Buenos tardes🐧/ Good Afternoon🐧";
    } else {
        saludo.textContent = "Buenas noches🐧 / Night night 🐧";
    }
}

actualizarSaludo();

function mostrarFrase() {
    const indiceAleatorio = Math.floor(Math.random() * frases.length);
    frase.textContent = frases[indiceAleatorio];
}

mostrarFrase();

function mostrarAlerta() {
    modalAlerta.style.display = "flex";
    sonidoAlerta.play();
    pinguinoApp.src = imagenesPinguino.enojado;
}

function actualizarPinguino() {
    if (pomodoroCorriendo) {
        pinguinoApp.src = imagenesPinguino[faseActual];
    } else {
        pinguinoApp.src = imagenesPinguino.inactivo;
    }
}

function reiniciarTemporizador() {
    clearTimeout(temporizadorInactividad);
    temporizadorInactividad = setTimeout(mostrarAlerta, 600000);
}

function mostrarTiempo() {
    const minutos = Math.floor(segundosRestantes / 60);
    const segundos = segundosRestantes % 60;

    pomodoroTiempo.textContent =
        String(minutos).padStart(2, '0') + ":" + String(segundos).padStart(2, '0');
}

function tic() {
    segundosRestantes = segundosRestantes - 1;
    mostrarTiempo();

    if (segundosRestantes <= 0) {
        pausarPomodoro();
        siguienteFase();
        sonidoAlerta.play();
        mostrarModalFase();
    }
}

function iniciarPomodoro() {
    if (pomodoroCorriendo) {
        return;
    }

    pomodoroCorriendo = true;
    pomodoroIniciar.textContent = "Pausar";
    intervaloPomodoro = setInterval(tic, 1000);
    actualizarPinguino();
}

function pausarPomodoro() {
    pomodoroCorriendo = false;
    pomodoroIniciar.textContent = "Iniciar";
    clearInterval(intervaloPomodoro);
    actualizarPinguino();
}

function alternarPomodoro() {
    if (pomodoroCorriendo) {
        pausarPomodoro();
    } else {
        iniciarPomodoro();
    }
}

function reiniciarPomodoro() {
    pausarPomodoro();
    faseActual = "enfoque";
    sesionesCompletadas = 0;
    segundosRestantes = configPomodoro.enfoque * 60;
    mostrarTiempo();
    mostrarEstado();
    actualizarPinguino();
}

function mostrarEstado() {
    const nombres = {
        enfoque: "Enfoque",
        descansoCorto: "Descanso corto",
        descansoLargo: "Descanso largo"
    };

    pomodoroEstado.textContent =
        nombres[faseActual] + " · Sesión " + (sesionesCompletadas + 1);
}

function siguienteFase() {
    if (faseActual === "enfoque") {
        sesionesCompletadas = sesionesCompletadas + 1;

        if (sesionesCompletadas % configPomodoro.sesionesHastaDescansoLargo === 0) {
            faseActual = "descansoLargo";
        } else {
            faseActual = "descansoCorto";
        }
    } else {
        faseActual = "enfoque";
    }

    if (faseActual === "enfoque") {
        pomodoroTiempo.style.color = "#1b3a4b";
    } else {
        pomodoroTiempo.style.color = "#f5a623";
    }

    segundosRestantes = configPomodoro[faseActual] * 60;
    mostrarTiempo();
    mostrarEstado();
    actualizarPinguino();
}

function mostrarModalFase() {
    modalFaseMensaje.textContent = mensajesFase[faseActual];
    modalFase.style.display = "flex";
}

function alternarConfigPomodoro() {
    if (pomodoroConfig.style.display === "none") {
        configEnfoque.value = configPomodoro.enfoque;
        configDescansoCorto.value = configPomodoro.descansoCorto;
        configDescansoLargo.value = configPomodoro.descansoLargo;
        configSesiones.value = configPomodoro.sesionesHastaDescansoLargo;

        pomodoroConfig.style.display = "block";
    } else {
        pomodoroConfig.style.display = "none";
    }
}

function leerMinutos(input, minimo, maximo, porDefecto) {
    const valor = Number(input.value);

    if (isNaN(valor) || valor < minimo || valor > maximo) {
        return porDefecto;
    }
    return valor;
}

function guardarConfigPomodoro() {
    configPomodoro.enfoque = leerMinutos(configEnfoque, 1, 90, 25);
    configPomodoro.descansoCorto = leerMinutos(configDescansoCorto, 1, 30, 5);
    configPomodoro.descansoLargo = leerMinutos(configDescansoLargo, 1, 60, 25);
    configPomodoro.sesionesHastaDescansoLargo = leerMinutos(configSesiones, 1, 10, 4);

    guardarDatos();
    pomodoroConfig.style.display = "none";
    reiniciarPomodoro();
}

function agregarTarea() {
    const texto = inputAgregar.value.trim();

    if (texto === "") {
        return;
    }

    tareas.push({ texto: texto, completada: false });
    inputAgregar.value = "";
    renderizarTareas();
    guardarDatos();
}

function agregarNota() {
    const texto = inputNota.value.trim();
    if (texto === "") {
        return;
    }

    const desplazamiento = (notas.length % 8) * 30;

    notas.push({
        texto: texto,
        x: 450 + desplazamiento,
        y: 150 + desplazamiento,
        color: colorSeleccionado,
        prioridad: prioridadSeleccionada
    });

    inputNota.value = "";
    renderizarNotas();
    guardarDatos();
}

function alternarPanelNota() {
    if (panelNota.style.display === "none") {
        panelNota.style.display = "block";
        inputNota.focus();
    } else {
        panelNota.style.display = "none";
    }
}

function renderizarNotas() {
    listaNotas.innerHTML = "";

    notas.forEach(function (nota, indice) {
        const div = document.createElement("div");

        div.style.left = nota.x + "px";
        div.style.top = nota.y + "px";
        div.style.backgroundColor = nota.color;
        div.style.borderColor = coloresPrioridad[nota.prioridad] || "transparent";

        if (nota.x > window.innerWidth - 50) {
            nota.x = window.innerWidth - 200;
        }

        if (nota.y > window.innerHeight - 50) {
            nota.y = window.innerHeight - 200;
        }

        if (nota.x < 0) {
            nota.x = 20;
        }

        if (nota.y < 0) {
            nota.y = 20;
        }

        const spanNota = document.createElement("span");
        spanNota.textContent = nota.texto;
        spanNota.style.minWidth = "0";

        const botonEditarNota = document.createElement("button");
        botonEditarNota.textContent = "✎";
        botonEditarNota.style.flexShrink = "0";
        botonEditarNota.addEventListener("click", function () {
            editarNota(indice);
        });

        const botonEliminarNota = document.createElement("button");
        botonEliminarNota.textContent = "x";
        botonEliminarNota.style.flexShrink = "0";
        botonEliminarNota.addEventListener("click", function () {
            eliminarNota(indice);
        });

        div.addEventListener("mousedown", function (evento) {
            if (evento.target.tagName === "BUTTON") {
                return;
            }

            const desfaseX = evento.clientX - nota.x;
            const desfaseY = evento.clientY - nota.y;

            function mover(eventoMover) {
                let nuevaX = eventoMover.clientX - desfaseX;
                let nuevaY = eventoMover.clientY - desfaseY;

                const maxX = window.innerWidth - div.offsetWidth;
                const maxY = window.innerHeight - div.offsetHeight;

                nota.x = Math.max(0, Math.min(nuevaX, maxX));
                nota.y = Math.max(0, Math.min(nuevaY, maxY));

                div.style.left = nota.x + "px";
                div.style.top = nota.y + "px";
            }

            function soltar() {
                document.removeEventListener("mousemove", mover);
                document.removeEventListener("mouseup", soltar);
                guardarDatos();
            }

            document.addEventListener("mousemove", mover);
            document.addEventListener("mouseup", soltar);
        });

        div.appendChild(spanNota);
        div.appendChild(botonEditarNota);
        div.appendChild(botonEliminarNota);
        listaNotas.appendChild(div);
    });
}

function eliminarNota(indice) {
    notas.splice(indice, 1);
    renderizarNotas();
    guardarDatos();
}

function marcarCompletada(indice) {
    tareas[indice].completada = !tareas[indice].completada;
    renderizarTareas();
    guardarDatos();
}

function eliminarTarea(indice) {
    tareas.splice(indice, 1);
    renderizarTareas();
    guardarDatos();
}

function editarTarea(indice) {
    tipoEdicion = "tarea";
    indiceEditando = indice;
    modalEditarTitulo.textContent = "Edita tu tarea";
    inputEditar.value = tareas[indice].texto;
    modalEditar.style.display = "flex";
    inputEditar.focus();
}

function editarNota(indice) {
    tipoEdicion = "nota";
    indiceEditando = indice;
    modalEditarTitulo.textContent = "Edita tu nota";
    inputEditar.value = notas[indice].texto;
    modalEditar.style.display = "flex";
    inputEditar.focus();
}

function confirmarEdicion() {
    const nuevoTexto = inputEditar.value.trim();

    if (nuevoTexto === "") {
        return;
    }

    if (tipoEdicion === "tarea") {
        tareas[indiceEditando].texto = nuevoTexto;
        renderizarTareas();
    } else {
        notas[indiceEditando].texto = nuevoTexto;
        renderizarNotas();
    }

    modalEditar.style.display = "none";
    indiceEditando = null;
    guardarDatos();
}

function actualizarContador() {
    const total = tareas.length;
    const completadas = tareas.filter(function (tarea) {
        return tarea.completada;
    }).length;

    contadorTareas.textContent = `${completadas} de ${total} completadas`;
}

function renderizarTareas() {
    listaTareas.innerHTML = "";

    tareas.forEach(function (tarea, indice) {
        const li = document.createElement("li");

        const spanTexto = document.createElement("span");
        spanTexto.textContent = tarea.texto;

        if (tarea.completada) {
            spanTexto.style.textDecoration = "line-through";
        }

        li.appendChild(spanTexto);

        li.addEventListener("click", function () {
            marcarCompletada(indice);
        });

        const botonEditar = document.createElement("button")
        botonEditar.textContent = "✎";
        botonEditar.className = "boton-editar";
        botonEditar.addEventListener("click", function (evento) {
            evento.stopPropagation();
            editarTarea(indice);
        });

        const botonEliminar = document.createElement("button");
        botonEliminar.textContent = "X";
        botonEliminar.addEventListener("click", function (evento) {
            evento.stopPropagation();
            eliminarTarea(indice);
        });

        li.appendChild(botonEditar);
        li.appendChild(botonEliminar);
        listaTareas.appendChild(li);
    });

    actualizarContador();
}

function guardarDatos() {
    localStorage.setItem("tareas", JSON.stringify(tareas));
    localStorage.setItem("notas", JSON.stringify(notas));
    localStorage.setItem("configPomodoro", JSON.stringify(configPomodoro));
}

configEnfoque.value = configPomodoro.enfoque;
configDescansoCorto.value = configPomodoro.descansoCorto;
configDescansoLargo.value = configPomodoro.descansoLargo;
configSesiones.value = configPomodoro.sesionesHastaDescansoLargo;

function cargarDatos() {
    const tareasGuardadas = localStorage.getItem("tareas");
    const notasGuardadas = localStorage.getItem("notas");
    const configGuardada = localStorage.getItem("configPomodoro");

    if (tareasGuardadas !== null) {
        tareas = JSON.parse(tareasGuardadas);
    }

    if (notasGuardadas !== null) {
        notas = JSON.parse(notasGuardadas);
    }

    if (configGuardada !== null) {
        configPomodoro = JSON.parse(configGuardada);
    }

    renderizarTareas();
    renderizarNotas();
}

modalCerrar.addEventListener("click", function () {
    modalAlerta.style.display = "none";
    reiniciarTemporizador();
    actualizarPinguino();
});

window.addEventListener("mousemove", reiniciarTemporizador);
window.addEventListener("keydown", reiniciarTemporizador);
window.addEventListener("click", reiniciarTemporizador);

botonAgregar.addEventListener("click", agregarTarea);

inputAgregar.addEventListener("keydown", function (evento) {
    if (evento.key === "Enter") {
        agregarTarea();
    }
});

botonNota.addEventListener("click", alternarPanelNota);

botonGuardarNota.addEventListener("click", function () {
    agregarNota();
    panelNota.style.display = "none";
})

inputNota.addEventListener("keydown", function (evento) {
    if (evento.key === "Enter") {
        agregarNota();
        panelNota.style.display = "none";
    }
});

botonEmpezar.addEventListener("click", empezarApp);

botonesColor.forEach(function (boton) {
    boton.addEventListener("click", function () {
        colorSeleccionado = boton.dataset.color;

        botonesColor.forEach(function (otroBoton) {
            otroBoton.classList.remove("seleccionado");
        });

        boton.classList.add("seleccionado");
    })
});

botonesPrioridad.forEach(function (boton) {
    boton.addEventListener("click", function () {
        prioridadSeleccionada = boton.dataset.prioridad;

        botonesPrioridad.forEach(function (otroBoton) {
            otroBoton.classList.remove("seleccionado");
        });

        boton.classList.add("seleccionado");
    })
})

guardarEdicion.addEventListener("click", confirmarEdicion);

cancelarEdicion.addEventListener("click", function () {
    modalEditar.style.display = "none";
    indiceEditando = null;
});

inputEditar.addEventListener("keydown", function (evento) {
    if (evento.key === "Enter") {
        confirmarEdicion();
    }
});

pomodoroIniciar.addEventListener("click", alternarPomodoro);
pomodoroReiniciar.addEventListener("click", reiniciarPomodoro);
pomodoroConfigAbrir.addEventListener("click", alternarConfigPomodoro);
configGuardar.addEventListener("click", guardarConfigPomodoro);

modalFaseCerrar.addEventListener("click", function () {
    modalFase.style.display = "none";
});


cargarDatos();

segundosRestantes = configPomodoro.enfoque * 60;
mostrarTiempo();
mostrarEstado();
actualizarPinguino();