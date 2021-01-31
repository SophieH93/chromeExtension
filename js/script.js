const addItemForm = document.querySelector('#addItemForm');
const itemsList = document.querySelector('.actionItems'); 
const storage = chrome.storage.sync;
let actionItemUtils = new ActionItems();

storage.get(['actionItems', 'name'], (data) => {
    let actionItems = data.actionItems;
    let name = data.name
    setUsesName(name);
    setGreeting();
    setGreetingImage();
    createQuickActionListener();
    renderActionItems(actionItems);
    createUpdateNamedDialogListener();
    createUpdateNameListener();
    actionItemUtils.setProgress();
    chrome.storage.onChanged.addListener(()=> {
        actionItemUtils.setProgress();
    })
});


function myFunction() {
    var element = document.body;
    element.classList.toggle("dark-mode");
 }

const setUsesName = (name) => {
    let newName = name ? name : 'Add Name';
    document.querySelector('.name__value').innerText = newName
}

const renderActionItems = (actionItems) => {
    const filteredItems = filterActionItems(actionItems);
    filteredItems.forEach((item) => {
        renderActionItem(item.text, item.id, item.completed, item.website);
    })
    storage.set({
        actionItems: filteredItems
    })
}

const filterActionItems = (actionItems) => {
    let currentDate = new Date();
    currentDate.setHours(0,0,0,0);
    const filteredItems = actionItems.filter((item)=>{
        if(item.completed){
            const completedDate = new Date(item.completed);
            if(completedDate < currentDate){
                return false;
            }            
        }
        return true;   
    })    
    return filteredItems;
}

const createUpdateNamedDialogListener = () => {
    let greetingName = document.querySelector('.greeting__name')
    greetingName.addEventListener('click', ()=>{
        storage.get(['name'], ()=>{
            let name = data.name ? data.name : '';
            document.getElementById('inputName').value = name 
        })
        $('#updateNameModal').modal('show')

    })
}

const handleQuickActionListener = (e) => {
    const text = e.target.getAttribute('data-text');
    const id = e.target.getAttribute('data-id');
    getCurrentTab().then((tab)=>{
        actionItemUtils.addQuickActionItem(id, text, tab, (actionItem)=>{
            renderActionItem(actionItem.text, actionItem.id, actionItem.completed, actionItem.website, 250)
        });
    })
}

const handleUpdateName = (e) => {
    const name = document.getElementById('inputName').value;
    if(name){
        actionItemUtils.saveName(name, ()=>{
        setUsesName(name);
        $('#updateNameModal').modal('hide');
        })
    }
}

const createUpdateNameListener = () => {
    let element = document.querySelector('#updateName');
    element.addEventListener('click', handleUpdateName)
}

const createQuickActionListener = () => {
    let buttons = document.querySelectorAll('.quick-action');
    buttons.forEach((button)=>{
        button.addEventListener('click', handleQuickActionListener);
    })
}

async function getCurrentTab(){
    return await new Promise((resolve, reject)=>{
        chrome.tabs.query({ 'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT }, (tabs)=>{
            resolve(tabs[0]);
        })
    })
}

addItemForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let itemText = addItemForm.elements.namedItem('itemText').value;
    if(itemText) {
        actionItemUtils.add(itemText, null, (actionItem)=>{
            renderActionItem(actionItem.text, actionItem.id, actionItem.completed, actionItem.website, 250)
            addItemForm.elements.namedItem('itemText').value = ' ';
        })
    }
})

const handleCompletedEventListener = (e) => {    
    const id = e.target.parentElement.parentElement.getAttribute('data-id');
    const parent = e.target.parentElement.parentElement;
    if(parent.classList.contains('completed')){
        actionItemUtils.markUnmarkCompleted(id, null)
        parent.classList.remove('completed');
    } else {
        actionItemUtils.markUnmarkCompleted(id, new Date().toString());
        parent.classList.add('completed');
    }
}

const handleDeleteEventListener = (e) => {
    const id = e.target.parentElement.parentElement.getAttribute('data-id');
    const parent = e.target.parentElement.parentElement;
    const jElement = $(`div[data-id="${id}"]`);
    actionItemUtils.remove(id, ()=> {
        animatUp(jElement);
    });
}

const renderActionItem = (text, id, completed, website=null, animationDuration=450) => {
    let element = document.createElement('div');
    element.classList.add('actionItem__item');
    let mainElement = document.createElement('div');
    mainElement.classList.add('actionItem__main');
    let checkElement = document.createElement('div');
    checkElement.classList.add('actionItem__check');
    let textElement = document.createElement('div');
    textElement.classList.add('actionItem__text');
    let deleteElement = document.createElement('div');
    deleteElement.classList.add('actionItem__delete');
    checkElement.innerHTML = `
        <div class="actionItem__checkBox">
            <i class="fas fa-check" aria-hidden="true"></i>
        </div>
    `
    if(completed){
        element.classList.add('completed');
    }
    element.setAttribute('data-id', id);
    deleteElement.addEventListener('click', handleDeleteEventListener);
    checkElement.addEventListener('click', handleCompletedEventListener);
    textElement.textContent = text;
    deleteElement.innerHTML = `<i class="fas fa-times" aria-hidden="true"></i>`;
    mainElement.appendChild(checkElement);
    mainElement.appendChild(textElement);
    mainElement.appendChild(deleteElement);
    element.appendChild(mainElement);
    if(website){
        let linkContainer = createLinkContainer(website.url, website.fav_icon, website.title);
        element.appendChild(linkContainer);
    }
    itemsList.prepend(element);
    let jElement = $(`div[data-id="${id}"]`);
    animateDown(jElement, animationDuration);
}

const animateDown = (element, duration) => {
    //Animation for adding items
    let height = element.innerHeight();
    element.css({ marginTop: `-${height}px`, opacity:0 }).animate({
        opacity: 1,
        marginTop: '12px',
    }, duration)
}

const animatUp = (element) => {
    // Animation for deleting an item
    let height = element.innerHeight();
    element.animate({
        opacity: '0',
        marginTop: `-${height}px`
    }, 250, ()=> {
    element.remove();
    })
}

const createLinkContainer=(url, favIcon, title) => {
    let element = document.createElement('div');
    element.classList.add('actionItem__linkContainer');
    element.innerHTML = `
        <a href="${url}" target="_blank">
        <div class="actionItem__link">
            <div clas="actionItem__favIcon">
                <img src=${favIcon} alt=""/>
            </div>
            <div class="actionItem__title">
                <span>${title}</span>
            </div>
        </div>
    </a>
    `
    return element;
}

const setGreeting = () => {
    let greeting = "Good ";
    const date = new Date();
    const hours = date.getHours();
    if(hours >= 5 && hours <= 11) {
        greeting += " Morning";
    } else if(hours >= 12 && hours <= 16){
        greeting += " Afternoon";
    }else if (hours >= 17 && hours <= 20){
        greeting += " Evening";
    } else {
        greeting += "Night";
    }    
    document.querySelector('.greeting__type').innerText = greeting;
}

const setGreetingImage = () => {
    let image = document.getElementById('greeting__image');
    const date = new Date();
    const hours = date.getHours();
    if(hours >= 5 && hours <= 11) {
        image.src= './images/good-morning.png';
    } else if(hours >= 12 && hours <= 16){
        image.src= './images/good-afternoon.png';
    }else if (hours >= 17 && hours <= 20){
        image.src= './images/good-evening.png';
    } else {
        image.src= './images/good-night.png';
    }  

    var button = document.querySelector("button");
    var isColored = false;
    
    button.addEventListener("click", function(){
    if(isColored){
    document.body.style.background = "white";
    document.querySelector(".greeting__type").style.color = "black";
    document.querySelector(".name__value").style.color = "black";
    document.querySelector(".progressbar-text").style.color = "black";
    document.querySelector(".actionInput").style.background = "white";
    document.querySelector(".actionInput").style.color = "black";
    document.querySelector(".actionInput__suggestions").style.color = "black";
    document.querySelector(".dark-mode").style.color = "black";
    isColored = false;
    } else{
    document.body.style.background = "#333";
    document.querySelector(".greeting__type").style.color = "#e6f0e6";
    document.querySelector(".name__value").style.color = "#fa9d07";
    document.querySelector(".progressbar-text").style.color = "white";
    document.querySelector(".actionInput").style.background = "#333";
    document.querySelector(".actionInput").style.color = "#04ba0a";
    document.querySelector(".dark-mode").style.color = "white";
    isColored = true;
    }
    });        
}
