// document.body.innerText= `The asset Id is ${window.location.href}`
  const fileInput = document.getElementById("fileInput")

fileInput.addEventListener('change',async()=>{
    console.log("Asset is uploading...")

    try{
        const assetId = '1bd13868-d068-48bd-9499-0962ab91698c'
        const s3Url = 'https://dam-655707937370-eu-north-1-an.s3.eu-north-1.amazonaws.com/uploads/2026-06-29-1bd13868-d068-48bd-9499-0962ab91698c/TestEmbed.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAZRKZ5DJNBK2RLTV5%2F20260629%2Feu-north-1%2Fs3%2Faws4_request&X-Amz-Date=20260629T195136Z&X-Amz-Expires=18000&X-Amz-Signature=a5c1b35beead073eefc2d2d62b2f36a675ca4e3d38b24501b3ee4eb64fc60c87&X-Amz-SignedHeaders=host&x-id=PutObject'
        const response = await fetch(`${window.location.origin}/api/v1/assets/addEmbedding`,{
            method:'POST',
            body:{assetId,s3Url},
            headers:{'Content-Type':'application/json'}
        })

        const result =  await response.json()
        console.log(`Result from embedding:`,result)
    }catch(err){
        console.log(`Error: ${err}`)
    }
})
