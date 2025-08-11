const db = new Dexie('shortlink')

const formLink = document.querySelector('#formShortLink')
const msg = document.querySelector('#message')
const diviTems = document.querySelector('.data_links')
const msgoutput = document.querySelector('.message-output')

const urlPagina = new URLSearchParams(window.location.search)

db.version(1).stores({
    urls: `++id,code,long_url,clicks`
});

// Estrutura da Tabela

// id = ID Primario com Auto incremente
// code = Codigo gerado da URL Curta
// long_url = URL a ser encurtada
// clicks = total de visitas a URL Curta

async function validarURL(url){

    const regex = /^(http|https):\/\/([\w-]+(\.[\w-]+)+)(\/[\w-./?%&=]*)?$/;
    return regex.test(url);

}

function gerarCodigo(tam = 6){
    const alfabeto = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
    let codigo = ""
    for(let i = 0; i < tam; i++){
        const indice = Math.floor(Math.random() * alfabeto.length)
        codigo += alfabeto[indice]
    }
    return codigo
}

async function checkCode(){

    if(urlPagina.get('c') != null){

        const codeurl = urlPagina.get('c');

        const pag = await db.urls.where('code').equals(`${codeurl}`).first()

        if(pag){
            const click = pag.clicks + 1
            await db.urls.update(pag.id, { clicks: click})
            window.location.href = `${pag.long_url}`

        }
        

    }

}

async function getLinks() {

    const allitems = await db.urls.reverse().toArray()

    const defaultLink = `${window.location}`

    diviTems.innerHTML = allitems.map(mylink => 
        `<div class="linha">
                <div class="celula">${mylink.id}</div>
                <div class="celula">${mylink.long_url}</div>
                <div class="celula"><a class="ahref" href="${defaultLink}?c=${mylink.code}">${defaultLink}?c=${mylink.code}</a></div>
                <div class="celula">Clicks: ${mylink.clicks}</div>
            </div>`
    ).join('')

}

formLink.addEventListener('submit', async function(e){
    e.preventDefault()
    const urlInput = document.querySelector('#urlong')

    if(urlInput.value.length == 0){
        console.log('Este campo está vazio.')
        return;
    }else{

        const cod = gerarCodigo()

        const p = document.createElement('p')

        await db.urls.add({code: cod, long_url: urlInput.value, clicks: 0}).then((result) => {
            const urlCurta = `${window.location}?c=${cod}`
            //p.innerHTML = `URL Encurtada para: <a href="${urlCurta}">${urlCurta}</a>`
            p.innerText = `URL Encurtada com sucesso!`
            msg.appendChild(p)
        }).catch((err) => {
            console.error(`Ocorreu um erro: ${err}`)
        })

        await getLinks()

    }

})


window.onload = getLinks()

checkCode()