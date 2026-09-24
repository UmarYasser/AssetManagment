const sidebar = document.getElementById('sidebar');
const grid = document.getElementById('grid');
const searchBar = document.getElementById("searchInput")
const folderList = document.getElementById("folderList")
const yoursBtn = document.getElementById("yoursBtn")
const myPageBtn = document.getElementById("myPageBtn")
const myPageList = document.getElementById("myPageBtn")
// Toggle sidebar when clicking anywhere on the empty space of the sidebar, 
// or you can change this to a specific button if you prefer.
let assetIdGlo
let activeAssetId  = null
let s3KeyGlo
let assetNameGlo

function toggleFolderList(assetId, buttonElement) {
    if (activeAssetId === assetId) {
        // Same asset clicked: Close it
        folderList.classList.remove('flex');
        activeAssetId = null;
    } else {
        // Different asset or first time: Open/Move
        folderList.classList.remove('flex');
        const rect = buttonElement.getBoundingClientRect();
        
        // Update position (using fixed positioning)
        folderList.style.top = `${rect.bottom + window.scrollY}px`;
        folderList.style.left = `${rect.left + window.scrollX}px`;
        
        folderList.classList.add('flex');
        activeAssetId = assetId;
    }
}

async function loadAssets(assets,viewUrls){
    let asset
    let aspectRatio
    assets.map((ass,index) =>{
        aspectRatio = ass.width / ass.height
        asset = document.createElement('div')
        asset.classList.add("assetDiv")
        asset.innerHTML = `
            <div class="saveBtn"> Save </div>
            <a class="downloadBtn" download="${ass.assetName}" href=${viewUrls[index]}> <i class="fa-solid fa-cloud-arrow-down"></i> </a>
            <img src=${viewUrls[index]} />
            <span id="${ass.id}"></span>
            <p class="assetName"> ${ass.assetName}</p>
        `
        grid.appendChild(asset)
    })
}

document.addEventListener('DOMContentLoaded',async ()=>{
    if(!localStorage.getItem('userId')){}
    
    const response = await fetch(`${window.location.origin}/api/v1/assets/getAll`,{
        method: "GET",
        headers: { "Content-Type": "application/json"}
    })
    const result = await response.json()
    const {assets,viewUrls} = result
    // console.log(result)
    console.log(result)

    // Auto-expand on load for desktop (optional, remove if you want it collapsed initially)
    // sidebar.classList.add('expanded');
    
    const userFolders = JSON.parse(localStorage.getItem('userFolders'))
    const folderUrls = userFolders.map((folder,index) => folder.assetFolder[0]?.asset?.s3Key)
    const imageUrls = await fetch(`${window.location.origin}/api/v1/assets/fetchImages`,{
        method:'POST',
        body: JSON.stringify(folderUrls),
        headers: {'Content-Type': 'application/json'}
    })

    const imageRes = await imageUrls.json()
    folderList.innerHTML += userFolders.map((folder,index) =>`
        <div class="folderItem">
        <img class="folderImage"   src=${imageRes[0]} />
        <p class="folderName">${folder.folderName}</p>
        <span id=${folder.id}></span>
        </div>
        `
    ).join('')
    loadAssets(assets,viewUrls)
    // 2. Generate Dummy Content

   
    document.addEventListener("click",async (e) =>{
        const div  = e.target.closest('.assetDiv')
        console.log("Clicked on:",div)
        if(div)
             s3KeyGlo = new URL(div?.querySelector('img')?.src)?.pathname?.slice(1)
        const assetId = div?.querySelector('span')?.id || assetIdGlo
         const sameAsset = assetId == assetIdGlo
         if(div)
            assetNameGlo = div?.querySelector('p').textContent;console.log("assetNameGlo:",assetNameGlo)

        // console.log("S3Key:",new URL(div?.querySelector('img')?.src))
        console.log("-----------------")
         
        if(div // Clicked on the photo not the save or download buttons
            && e.target !== div.querySelector('.saveBtn')
            && e.target !== div.querySelector('.downloadBtn')){
                
                if(e.target.classList.contains('assetDiv')){
                    console.log(`An asset has been clicken on: ${e.target}`)
                }
                
                window.location.href = `/asset?id=${assetId}`
            }
            
        //Clicked on the Save button
        if(e.target.classList.contains('saveBtn')){
            if(!sameAsset){
                folderList.querySelectorAll('.folderItem').forEach(item =>{
                    item.disabled =false
                    item.style.backgroundColor= ''
                })
            }
                toggleFolderList(assetId, e.target)
        }

        // CLICKING ON A FOLDER FROM THE FOLDER LIST
        if(e.target.classList.contains('folderItem')){
            
            const folderId = e.target.querySelector('span').id
            console.log(`FolderId: ${folderId}, assetId: ${assetId}`)
            if(folderList.classList.contains('flex')){
                

                const saveBody = {assetId:assetId,folderId:folderId}
                    //🚨 Make hte folderList reset if clicking on a new asset
                    
                const response = await fetch(`${window.location.origin}/api/v1/folder/moveToFolder`,{
                    method:'POST',
                    body:JSON.stringify(saveBody),
                    headers:{'Content-Type':'application/json'}
                })
                
                if(response.ok || response.status === 409){
                    // e.target.textContent = "Saved"
                    e.target.disabled = true
                    e.target.style.backgroundColor = response.status === 409 ? 'var(--color33)' : ' var(--color2)'
                }
                const result = await response.json()
                console.log("Result from saving to folder:",result)

                const uFolders = JSON.parse(localStorage.getItem('userFolders'))
                uFolders.forEach(fd =>{
                    if( fd.id == folderId){
                        if(fd.assetFolder.length < 2){
                            fd.assetFolder.push({asset:{assetName:assetNameGlo,s3Key:s3KeyGlo}})
                        }
                    }
                    return fd
                })
                console.log("Updated userFolders:",uFolders)
                localStorage.setItem('userFolders',JSON.stringify(uFolders))
            }
        }
        assetIdGlo = assetId
    })
})



searchBar.addEventListener('input',async()=>{

    const searchTerm = searchBar.value
    console.log(searchTerm)
    console.log(".value",searchBar.value)
    if(searchTerm.length >1){

        
        const response = await fetch(`${window.location.origin}/api/v1/assets/hybridSearch?name=${searchTerm}`,{
            method:"GET",
            headers:{'Content-Type':'application/json'}
        })
        const result = await response.json()
        console.log("Result from Search",result)
        const {assets,viewUrls} = result
        grid.replaceChildren()

        if(assets.length > 0){
            let asset
            assets.map((ass,index) =>{
                asset = document.createElement('div')
                asset.classList.add("assetDiv")
                asset.innerHTML = `
                    <div class="saveBtn"> Save </div>
                    <a class="downloadBtn" download="${ass.assetName}" href=${viewUrls[index]}> <i class="fa-solid fa-cloud-arrow-down"></i> </a>
                    <img src=${viewUrls[index]} />
                    <span id="${ass.id}"></span>
                    <p class="assetName"> ${ass.assetName}</p>
                `
                grid.appendChild(asset)
            })
            console.log("Result from Search",result)
        }else{
            console.log("No assets found")
            grid.replaceChildren()
            const div404 = document.createElement('div')
            div404.classList.add('notFound')
            div404.innerHTML = `
            <p>Asset not found</p>
            <div style="break-inside:avoid"> 
            <p class="one-piece"></p>
            </div>
            `
            grid.appendChild(div404)
        }
    }else{
        grid.replaceChildren()
            const response = await fetch(`${window.location.origin}/api/v1/assets/getAll`,{
            method: "GET",
            headers: { "Content-Type": "application/json"}
        })
        const result = await response.json()
        console.log(result)
        const {assets,viewUrls} = result

        loadAssets(assets,viewUrls)
    }
})


myPageBtn.addEventListener('click',() =>{

})

