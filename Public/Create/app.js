const fileInput = document.getElementById("fileInput")

async function fetchTimeout(url, options, timeout = 7000){
    const controller = new AbortController()
    const timeoutId = setTimeout(() =>{ controller.abort()}, timeout)
    return await fetch(url, {...options, signal: controller.signal}).finally(() =>{
        clearTimeout(timeoutId)
    })  
}

fileInput.addEventListener('change',async()=>{
    console.log("Asset is uploading...")

    try{
        const file = fileInput.files[0]
        const reqBody = {
            "assetName": "TestEmbed",
            "type": file.type == 'jpeg'? 'jpg' : file.type,
            "description": "Test Embed",
            "width":564,
            "height":1003,
            "fileSize": file.size
        } 

        const response = await fetch(`${window.location.origin}/api/v1/assets/upload`,{
            method:'POST',
            body:JSON.stringify(reqBody),
            headers:{
                'Content-Type':'application/json',
            },
            credentials:'same-origin'
        })
        const result= await response.json()
        console.log(result)
        const s3Url = result.mainUrl
        console.log(`File to upload:`,file)

        const s3Response = await fetch(s3Url,{
            method:'PUT',
            body:file,
            headers:{
                'Content-Type': file.type
            }
        })


        console.log(s3Response.status)
        console.log(await s3Response.text())

        if(s3Response.status !== 200){
            throw new Error(`Failed to upload file to S3. Status: ${s3Response.status}`)
        }
        
        
        const assetId = result.asset.id
        const embdResponse = await fetch(`${window.location.origin}/api/v1/assets/addEmbedding`,{
            method:'POST',
            body:JSON.stringify({assetId}),
            headers:{'Content-Type':'application/json'}
        }) 

        const embedResult =  await embdResponse.json()
        console.log(`embedResult from embedding:`,embedResult)
        
    }catch(err){
        console.log(`Error: ${err}`)
    }
})
