let actionItemUtils = new ActionItems();

chrome.contextMenus.create({

    "id": "linkSiteMenu",
    "title": "Link site for later",
    "contexts": ["all"]
})


chrome.runtime.onInstalled.addListener((details)=>{
    if(details.reason == 'install'){
        chrome.storage.sync.set({
            ActionItems: []
        })
    }
})

chrome.contextMenus.onClicked.addListener((info, tab)=>{
    if(info.menuitemId == "linkSiteMenu"){
        actionItemUtils.addQuickActionItem('quick-action-2', "Read this site", tab, ()=>{
            actionItemUtils.setProgress();
        })
    }
})