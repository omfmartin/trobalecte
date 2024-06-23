entrada = document.getElementById('entrada')

entrada.addEventListener("input", function (event) {

    pred_elem = document.getElementById("prediccion");
    pred_elem.textContent = '';
    pred_text = document.createTextNode(predire());
    pred_elem.appendChild(pred_text);

    function predire() {
        return entrada.value;
    }
})
