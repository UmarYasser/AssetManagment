const folderGrid = document.getElementById("foldersGrid")
let userFolders = JSON.parse(localStorage.getItem("userFolders"))
const savedTab = document.getElementById("savedTab")
const addFolderForm = document.getElementById("addFolderForm")
let  changeFName = false
let FNInput = document.getElementById("folderNameInput")
let userDataGlo

async function loadUserData(handler){
  //if handler = me
  
  try{
    const response = await fetch(`${location.origin}/api/v1/users/getOne/${handler}?option=own`,{
      headers: {'Content-Type': 'application/json'}
    })
    const result = await response.json()
    console.log("Result from loading user data",result)
    
    userDataGlo = result
    const imgResp = await fetch(`${location.origin}/api/v1/assets/fetchImages`,{
      method:'POST',
      body: JSON.stringify([result.pphoto_key]),
      headers: {'Content-Type':'application/json'}
    })

    const imgResu = await imgResp.json()
    console.log("Result from loading user photo:",imgResu)

    document.getElementById("userPhoto").src = imgResu[0]
    document.getElementById("myPageImg").src = imgResu[0]
    
    return result
  }catch(err){
    console.log("Error Loading User Data:",err)
  }
}

async function loadUserFolder(grid,folders){
  console.log("FROM LoadUserFolder Method \nLoading User Folders:",folders)
  let userFolders = JSON.parse(localStorage.getItem("userFolders"))

  const imagesBody = userFolders.map(folder => {
    return folder.assetFolder.map(af =>{ 
      return af.asset.s3Key
    })
  })

  const imagesRes = await fetch(`${location.origin}/api/v1/assets/fetchImages?option=folder`,{
    method:'POST',
    body: JSON.stringify(imagesBody),
    headers: {'Content-Type':'application/json'}
  })

  let imagesUrls = await imagesRes.json()

    grid.innerHTML += folders.map((folder,index) =>{
        return  `
        <div class="folderCard">
        <span id="${folder.id}"></span>
        <div class="folderImageCon">
        <img class="folderImage" src=${imagesUrls[index][0]}  />
        <img class="folderImage" src=${imagesUrls[index][1]}  />
        </div>
        <div class="folderOverlay"><button class="folderDelBtn">
            <i class="fa-solid fa-trash-can"></i>
        </button>
        <button class="folderOpenBtn">Open</button>
        </div>
        <div class="folderInfo"> 
        <p class="folderName"> ${folder.folderName} </p>
        <p class="folderCount"> to be removed assets <p>
        </div> 
        </div>     
        `
      }).join('')

      let addFolderDiv = document.createElement('div')
      addFolderDiv.id = "addFolder"
      addFolderDiv.classList.add("folderCard")
      addFolderDiv.innerHTML = `
        <i class="fa-regular fa-square-plus fa-xl"></i>
        <p> Add Folder</p>
        <form id="addFolderForm" >
          <input type="text" name="folderName" id="folderName" placeholder="Enter Folder Name...">
          <p>Is it Public?</p>
          <div id="radioCon">
            <label style="display:inline">
              <input type="radio" name="isPublic" value="true" checked>
                Yes
            </label>
            <label style="display:inline">
              <input type="radio"name="isPublic" value="false">
                No
            </label>
          </div>
          <div id="submitForm">Create Folder</div>
        </form>
      `
      folderGrid.appendChild(addFolderDiv)
      document.getElementById("addFolder").style.display = 'flex'
}

async function loadAssets(assets,viewUrls){
    let asset
    let aspectRatio
    assets.map((ass,index) =>{
        aspectRatio = ass.width / ass.height
        asset = document.createElement('div')
        asset.classList.add("assetDiv")
        asset.innerHTML = `
            <a class="downloadBtn" download="${ass.assetName}" href=${viewUrls[index]}> <i class="fa-solid fa-cloud-arrow-down"></i> </a>
            <img src=${viewUrls[index]} />
            <span id="${ass.id}"></span>
            <div class="delAss"><i class="fa-solid fa-trash-can"></i> </div>
            <p class="assetName"> ${ass.assetName}</p>
        `
        folderGrid.appendChild(asset)
    })
}

document.addEventListener("DOMContentLoaded", async() =>{
  const handlerParts = location.href.split('?')[1].split('=')
  const handler = handlerParts[1]
  
  const userData = await loadUserData(handler)
  // document.getElementById("userPhoto").src = 
  document.getElementById("userName").innerText=  userData.name

  await loadUserFolder(folderGrid,JSON.parse(localStorage.getItem("userFolders")))
  
  document.addEventListener("click", async(e)=>{
    console.log(e.target)
  
    if(e.target.id == "folderBackBtn"){

      folderGrid.replaceChildren()
      await loadUserFolder(folderGrid,JSON.parse(localStorage.getItem("userFolders")))
    }else if(e.target.closest(".folderCard") && !e.target.closest("#addFolder") && !e.target.classList.contains("folderDelBtn") && !e.target.classList.contains("fa-trash-can")){
      const folder = e.target.closest(".folderCard")
      const folderId = folder.querySelector("span").id
      const folderName = folder.querySelector(".folderInfo .folderName").innerText  
      console.log("Fodler Name:",folderName)
      try{
        const response = await fetch(`${location.origin}/api/v1/folder/getByFolder/${folderId}`,{
          headers:{"Content-Type": "application/json"}
        })

        const result = await response.json()
        const assets = result.map(folder => folder.asset)
        console.log("Assets in the folder:",result)
        const imageUrls = assets.map(asset => {
          return asset.s3Key
        })

        folderGrid.replaceChildren()
        const folderBackBtn = document.createElement('div')
        folderBackBtn.id = "folderBackBtn"

        folderBackBtn.innerHTML = '<i class="fa-solid fa-arrow-left"></i>'
        folderGrid.appendChild(folderBackBtn)

        const folderNameDiv = document.createElement('div')
        folderNameDiv.id = "folderNameIn"
        folderNameDiv.innerHTML = `
        <input type="text" id="folderNameInput" class="hidden">
        <span style="user-select:none;pointer-events:none"> ${folderName} </span>
        <i  id="FNPen" class="fa-solid fa-pen"></i>
        `
        const fIDSpan = document.createElement('span')
        fIDSpan.id = folderId
        fIDSpan.style.display = 'none'
        folderGrid.appendChild(fIDSpan)
        
        folderGrid.appendChild(folderNameDiv)
        FNInput = document.getElementById("folderNameInput")
        let viewUrls = await fetch(`${window.location.origin}/api/v1/assets/fetchImages`,{
          method:'POST',
          body: JSON.stringify(imageUrls),
          headers: {'Content-Type': 'application/json'}
        })
        viewUrls = await viewUrls.json()
        
        loadAssets(assets,viewUrls)
      }catch(err){
          console.log("Error At Clicking Folder:",err)
      }
    }else if(e.target.id =="createdTab"){
        folderGrid.replaceChildren()
        const response = await fetch(`${location.origin}/api/v1/assets/getByUser`,{
          headers:{"Content-Type":'application/json'}
        })
        const result = await response.json()


        const imageUrls = result.map(asset => {
          return asset.s3Key
        })

        let viewUrls = await fetch(`${window.location.origin}/api/v1/assets/fetchImages`,{
          method:'POST',
          body: JSON.stringify(imageUrls),
          headers: {'Content-Type': 'application/json'}
        })
        viewUrls = await viewUrls.json()
        
        console.log("Asset ViewUrls:", viewUrls)
        loadAssets(result,viewUrls)

    }else if(e.target.id == "savedTab" ){
        folderGrid.replaceChildren()
        await loadUserFolder(folderGrid,JSON.parse(localStorage.getItem("userFolders")))
    }else if(e.target.id == "addFolder"){
      console.log("User wants to add a folder")
      document.getElementById("addFolderForm").classList.toggle("flex")
      
    }else if(e.target.id == "submitForm"){
        const folderName = document.getElementById("folderName").value
        const selectedRadio = document.querySelector('input[name="isPublic"]:checked');
        const isPublic = selectedRadio ? selectedRadio.value : null;

        // 3. Put them in your clean object
        const formData = {
          folderName: folderName,
          isPublic: JSON.parse(isPublic)
        };

      const response = await fetch(`${location.origin}/api/v1/folder/create`,{
        method:"POST",
        body:JSON.stringify(formData),
        headers: {'Content-Type':'application/json'}
      })
      const result = await response.json()

      localStorage.setItem("userFolders", JSON.stringify(result.allfolders))
      folderGrid.replaceChildren()
      console.log("User Folders from LocalStorage:",JSON.parse(localStorage.getItem("userFolders")))
      await loadUserFolder(folderGrid,JSON.parse(localStorage.getItem("userFolders")))
      showToast(`${folderName} Folder Created`)
      //Change localStorage's userFolders
    }else if(e.target.classList.contains("folderDelBtn")){

      const folder = e.target.closest(".folderCard")
      const folderName = folder.querySelector('.folderInfo .folderName').innerText
      if(folderName == 'Saved')
        return showToast("You cannot delete the Saved folder")
      
      console.log(`Folder clicked on: `,folder)
      const folderId = folder.querySelector("span").id
      try{
        const response = await fetch(`${location.origin}/api/v1/folder/deleteFolder/${folderId}`,{
          method:"DELETE",
          headers:{'Content-Type': "application/json"}  
        })

        userFolders = JSON.parse(localStorage.getItem("userFolders")).filter(folder => folder.id != folderId)

        localStorage.setItem("userFolders", JSON.stringify(userFolders))
        folderGrid.replaceChildren()

        await loadUserFolder(folderGrid,userFolders)
        showToast(`${folderName} Folder Deleted`)
      }catch(err){
        console.log(`Error Deleting the Folder: ${err}`)
      }
    }else if(e.target.id == "folderNameIn"){ // Focusing on the field
      changeFName = true
      document.getElementById("folderNameIn").style.width = '250px'
      // document.getElementById("folder  NameIn").querySelector('span').style.opacity = '0'
      
      console.log("User wants to edit the folder name", FNInput)
      document.getElementById("folderNameIn").querySelector("span").style.display = 'width:250px'
      FNInput.classList.remove("hidden")
      FNInput.focus()
      FNInput.value = document.getElementById("folderNameIn").querySelector("span").innerText
      // document.getElementById("FNPen").style.inset = "10px -200px auto auto"
      document.getElementById("FNPen").style.opacity = '1'

      
    }else if(e.target.id == "FNPen"  && changeFName){
      console.log(`ChangeName:${changeFName}`)
      changeFName = false
      const newFName = FNInput.value
      console.log("New Folder's name:",newFName)

      const folderId = document.querySelector("#folderBackBtn + span").id

      if(newFName != document.getElementById("folderNameIn").querySelector("span").innerText){
        console.log("Folder Name is not the same")

        try{
          const response = await fetch(`${location.origin}/api/v1/folder/edit/${folderId}`,{
            method: 'PATCH',
            body: JSON.stringify({folderName:newFName}),
            headers:{'Content-Type':'application/json'}
          })

          const result = await response.json()
          console.log("Result Changing Folder Name:", result)

          let uFolders = JSON.parse(localStorage.getItem("userFolders"))
          uFolders = uFolders.map(folder => {
            if(folder.id == folderId) {
              folder.folderName = newFName
              console.log(`The Folder Changed`,folder)
            }
            return folder
          })

          localStorage.setItem("userFolders", JSON.stringify(uFolders))
          showToast("Folder Name Changed")
        }catch(err){
          console.log(`Error At Changing the folder name:`, err)
        }
      }
        document.getElementById("folderNameIn").querySelector("span").innerText = newFName
        // document.getElementById("FNPen").style.inset = "10px auto auto 10px"
        document.getElementById("FNPen").style.opacity = '0.5'
        FNInput.value = ''
    }else if(e.target.classList.contains('delAss')){
      console.log("Div Wanted to remove:",e.target.closest('.assetDiv'))  
      try{
        const assetDiv = e.target.closest('.assetDiv')
        const assetId = assetDiv.querySelector('span').id
        const folderId = folderGrid.querySelector("span").id
        console.log(`AssetId:${assetId} FolderId:${folderId}`)
        const response = await fetch(`${location.origin}/api/v1/folder/deleteAsset`,{
          method:'DELETE',
          body: JSON.stringify({assetId,folderId}),
          headers: {'Content-Type':'application/json'}
        })
        const result = await response.json()
        console.log("Result:", result)

        showToast("Asset Removed from Folder")
        assetDiv.remove() 
      }catch(err){
        console.log("Error Removing Asset from Folder:", err)
      }
    }else if(e.target.id == "userPhoto"){
      document.getElementById("changeUPCon").classList.toggle("flex")
    }else if(e.target.id == "changeUP"){
      document.getElementById("changeUPFile").click()
    }else if(e.target.id == "notifBtn"){
      document.getElementById("notifList").classList.toggle("flex")
      console.log("User is clicking on the notification bell")
    } 

  }) // CLick EVent

})

document.getElementById("changeUPFile").addEventListener("change",async(e)=>{
  const photo = e.target.files[0]
  console.log("User wants to change his photo to:",photo)
  try{

    const reqBody = {
      assetName: `${userDataGlo.id}-pphoto`,
      type: photo.type,
      width:577,
      height:1000,
      description: "Test Embed",
      fileSize: photo.size
    }

    const response = await fetch(`${location.origin}/api/v1/assets/upload?keyword=pphoto`,{
      method:'POST',
      body: JSON.stringify(reqBody),
      headers: {'Content-Type':'application/json'}
    })

    const result = await response.json()
    console.log("Result from uploading the photo:",result)
    const s3Url = result.mainUrl

    const s3Resp = await fetch(s3Url,{
      method: 'PUT',
      body: photo,
      duplex: 'half',
      headers: {'Content-Type': photo.type}
    })

    console.log("S3 Response:",s3Resp)
    console.log(await s3Resp.text())
  
      if(s3Resp.status !== 200){
          throw new Error(`Failed to upload file to S3. Status: ${s3Resp.status}`)
      }

      const response2 = await fetch(`${location.origin}/api/v1/assets/fetchImages`,{
        method:'GET',
        body:JSON.stringify([result.asset.s3Key]),
        headers:{'Content-Type':'application/json'}
      })

      const result2 = await response2.json()
      document.getElementById("userPhoto").src = result2 

      // const response3 = await fetch(`${location.origin}/api/v1/users/update/${userDataGlo.id}`,{
      //   method:'PATCH',
      //   body: JSON.stringify({pphoto_key:})
      // })
      // const res3 = await response3.json()
    }catch(err){
    console.log("Error Changing User Photo:",err)
  }
})

// =============================================
    // USER DATA — Replace with backend fetch later
    // =============================================
    const userData = {
      name: 'Alex Morgan',
      handle: '@alexmorgan',
      avatar: 'https://picsum.photos/seed/user-avatar-profile/100/100.jpg',
      folders: [
        {
          id: 1,
          name: 'Home Decor Inspiration',
          count: 24,
          images: [
            'https://picsum.photos/seed/folder1a/400/400.jpg',
            'https://picsum.photos/seed/folder1b/400/400.jpg',
          ]
        },
        {
          id: 2,
          name: 'Recipe Ideas',
          count: 18,
          images: [
            'https://picsum.photos/seed/folder2a/400/400.jpg',
            'https://picsum.photos/seed/folder2b/400/400.jpg',
          ]
        },
        {
          id: 3,
          name: 'Travel Bucket List',
          count: 42,
          images: [
            'https://picsum.photos/seed/folder3a/400/400.jpg',
            'https://picsum.photos/seed/folder3b/400/400.jpg',
          ]
        },
        {
          id: 4,
          name: 'Outfit Mood Boards',
          count: 31,
          images: [
            'https://picsum.photos/seed/folder4a/400/400.jpg',
            'https://picsum.photos/seed/folder4b/400/400.jpg',
          ]
        },
        {
          id: 5,
          name: 'DIY Projects',
          count: 15,
          images: [
            'https://picsum.photos/seed/folder5a/400/400.jpg',
            'https://picsum.photos/seed/folder5b/400/400.jpg',
          ]
        },
        {
          id: 6,
          name: 'Workout Routines',
          count: 9,
          images: [
            'https://picsum.photos/seed/folder6a/400/400.jpg',
            'https://picsum.photos/seed/folder6b/400/400.jpg',
          ]
        },
        {
          id: 7,
          name: 'Book Recommendations',
          count: 12,
          images: [
            'https://picsum.photos/seed/folder7a/400/400.jpg',
            'https://picsum.photos/seed/folder7b/400/400.jpg',
          ]
        },
        {
          id: 8,
          name: 'Garden & Plants',
          count: 27,
          images: [
            'https://picsum.photos/seed/folder8a/400/400.jpg',
            'https://picsum.photos/seed/folder8b/400/400.jpg',
          ]
        },
        {
          id: 9,
          name: 'Photography Tips',
          count: 6,
          images: [
            'https://picsum.photos/seed/folder9a/400/400.jpg',
            null, // only 1 image — shows placeholder for second slot
          ]
        },
      ]
    };


    // =============================================
    // SEARCH
    // =============================================
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && searchInput.value.trim()) {
        showToast(`Searching for "${searchInput.value.trim()}"...`);
        // Replace with: window.location.href = `/search?q=${encodeURIComponent(searchInput.value.trim())}`;
      }
    });

    // =============================================
    // TOAST
    // =============================================
    let toastTimer;
    function showToast(message) {
      const toast = document.getElementById('toast');
      toast.textContent = message;
      toast.classList.add('toast--visible');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove('toast--visible'), 2500);
    }