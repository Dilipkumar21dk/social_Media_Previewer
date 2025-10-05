document.addEventListener('DOMContentLoaded', () => {
    const platformPostTypes = {
        facebook: ['post','story','reel'],
        instagram: ['post','story','reel'],
        twitter: ['post'],
        linkedin: ['post','story'],
        youtube: ['video','shorts'],
        tiktok: ['video'],
        pinterest: ['pin','story']
    };

    const platformBtns = document.querySelectorAll('.post-platform-buttons .platform-btn');
    const leftPlatformBtns = document.querySelectorAll('.social-profile .platform');
    const postTypeBtns = document.querySelectorAll('.post-type-btn');
    const liveTextEl = document.getElementById('liveText');
    const fileInput = document.getElementById('fileInput');
    const uploadedFilesContainer = document.getElementById('uploadedFiles');
    const previewLogo = document.getElementById('previewLogo');
    const previewPlatformName = document.getElementById('previewPlatformName');
    const previewText = document.getElementById('previewText');
    const previewBox = document.getElementById('previewBox');
    const alertBox = document.getElementById('alertBox');
    const previewInteractions = document.getElementById('previewInteractions');
    const postTypeInput = document.getElementById('postType');

    let currentPlatform = 'facebook';
    let uploadedFilesList = [];

    const logoMap = {
        facebook:'asserts/facebook.svg',
        instagram:'asserts/instagram.svg',
        twitter:'asserts/twitter.svg',
        linkedin:'asserts/linked.svg',
        youtube:'asserts/youtube.png',
        tiktok:'asserts/tiktok.svg',
        pinterest:'asserts/pinterest.svg'
    };

    function setActivePlatform(platform){
        platformBtns.forEach(b => b.classList.toggle('active', b.dataset.platform === platform));
        leftPlatformBtns.forEach(b => b.classList.toggle('active', b.value === platform));
    }

    function updatePostTypes(platform){
        postTypeBtns.forEach(btn => {
            if(platformPostTypes[platform].includes(btn.dataset.type)){
                btn.style.display='inline-flex';
            } else {
                btn.style.display='none';
                btn.classList.remove('active');
            }
        });
        const firstType = platformPostTypes[platform][0];
        if(firstType){
            postTypeBtns.forEach(b => b.classList.remove('active'));
            const firstBtn = document.querySelector(`.post-type-btn[data-type="${firstType}"]`);
            firstBtn.classList.add('active');
            postTypeInput.value = firstType;
        }
    }

    function updatePreviewHeader(platform){
        previewLogo.src = logoMap[platform];
        previewPlatformName.textContent = platform.charAt(0).toUpperCase()+platform.slice(1);
    }

    function showAlert(msg){
        alertBox.style.display='flex';
        alertBox.textContent=msg;
        previewText.style.display='none';
        previewInteractions.style.display='none';
    }

    function clearAlert(){
        alertBox.style.display='none';
        alertBox.textContent='';
        previewText.style.display='';
        previewInteractions.style.display='';
    }

    function refreshPreview(){
        // clear preview content
        previewText.innerHTML='';
        if(liveTextEl.value) previewText.innerHTML=`<p>${escapeHtml(liveTextEl.value)}</p>`;
        uploadedFilesList.forEach(f=>{
            const elem=f.type.startsWith('image/')?document.createElement('img'):document.createElement('video');
            elem.src=f.url;
            if(!f.type.startsWith('image/')) elem.controls=true;
            elem.style.maxWidth='100%';
            elem.style.marginTop='6px';
            previewText.appendChild(elem);
        });
    }

    function escapeHtml(text){return text.replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}

    function validateAndAlert(){
        clearAlert();
        refreshPreview();
        const platform=currentPlatform;
        const type=postTypeInput.value;
        const text=liveTextEl.value||'';
        const images=previewText.querySelectorAll('img').length;
        const videos=previewText.querySelectorAll('video').length;

        if(platform==='twitter' && text.length>280){ showAlert("Twitter posts cannot exceed 280 characters."); return false; }
        if(platform==='twitter' && images>4){ showAlert("Twitter allows max 4 images."); return false; }
        if(platform==='instagram' && (images+videos)>10){ showAlert("Instagram allows max 10 images/videos."); return false; }
        if(platform==='instagram' && type==='reel' && videos!==1){ showAlert("Instagram Reel allows only one video."); return false; }
        if(platform==='facebook' && (images+videos)>10){ showAlert("Facebook allows max 10 images/videos."); return false; }
        if(platform==='facebook' && type==='reel' && videos!==1){ showAlert("Facebook Reel allows only one video."); return false; }
        if(platform==='linkedin' && images>9){ showAlert("LinkedIn allows max 9 images."); return false; }
        if(platform==='linkedin' && type==='story' && (images+videos)!==1){ showAlert("LinkedIn Story allows only one image/video."); return false; }
        if(platform==='youtube' && type==='video' && videos<1){ showAlert("YouTube Video requires a video."); return false; }
        if(platform==='youtube' && type==='shorts' && videos!==1){ showAlert("YouTube Shorts allows only one video."); return false; }
        if(platform==='tiktok' && videos!==1){ showAlert("TikTok allows only one video."); return false; }
        if(platform==='pinterest' && type==='pin' && images<1){ showAlert("Pinterest Pin requires an image."); return false; }
        return true;
    }

    // ---------- Event Listeners ----------
    platformBtns.forEach(btn=>btn.addEventListener('click',()=>{
        currentPlatform=btn.dataset.platform;
        setActivePlatform(currentPlatform);
        updatePostTypes(currentPlatform);
        updatePreviewHeader(currentPlatform);
        validateAndAlert();
    }));

    leftPlatformBtns.forEach(btn=>btn.addEventListener('click',()=>{
        currentPlatform=btn.value;
        setActivePlatform(currentPlatform);
        updatePostTypes(currentPlatform);
        updatePreviewHeader(currentPlatform);
        validateAndAlert();
    }));

    postTypeBtns.forEach(btn=>btn.addEventListener('click',()=>{
        postTypeBtns.forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        postTypeInput.value=btn.dataset.type;
        validateAndAlert();
    }));

    liveTextEl.addEventListener('input',validateAndAlert);

    fileInput.addEventListener('change', e=>{
        const files=Array.from(e.target.files);
        files.forEach(file=>{
            const url=URL.createObjectURL(file);
            uploadedFilesList.push({file,file,type:file.type,url});
            // show small preview in upload section
            const wrapper=document.createElement('div');
            wrapper.classList.add('uploaded-item');
            const elem=file.type.startsWith('image/')?document.createElement('img'):document.createElement('video');
            elem.src=url; if(!file.type.startsWith('image/')) elem.controls=true; elem.style.maxWidth='100px';
            wrapper.appendChild(elem);
            const closeBtn=document.createElement('span');
            closeBtn.textContent='×'; closeBtn.classList.add('file-close-btn');
            closeBtn.addEventListener('click',()=>{
                uploadedFilesList=uploadedFilesList.filter(f=>f.url!==url);
                wrapper.remove();
                validateAndAlert();
            });
            wrapper.appendChild(closeBtn);
            uploadedFilesContainer.appendChild(wrapper);
        });
        fileInput.value='';
        validateAndAlert();
    });

    document.addEventListener('click', e=>{
        if(e.target.classList.contains('close-btn')){
            const btn=e.target.closest('.platform');
            const platformValue=btn.value;
            btn.remove();
            const previewBtn=document.querySelector(`.platform-btn[data-platform="${platformValue}"]`);
            if(previewBtn) previewBtn.remove();
            const first=document.querySelector('.post-platform-buttons .platform-btn');
            if(first) first.click();
            else { currentPlatform=null; previewText.innerHTML=''; previewLogo.src=''; previewPlatformName.textContent=''; clearAlert();}
        }
    });

    // ---------- Initialize ----------
    setActivePlatform(currentPlatform);
    updatePostTypes(currentPlatform);
    updatePreviewHeader(currentPlatform);
    validateAndAlert();
});
// Live text sync between Social Profile and Post Preview
const liveText = document.getElementById('liveText');
if (liveText) {
    liveText.addEventListener('input', function() {
        const previewBox = document.getElementById('previewBox');
        let p = previewBox.querySelector('p');
        if (!p) {
            p = document.createElement('p');
            previewBox.appendChild(p);
        }
        p.textContent = liveText.value;
        // If text is deleted, also delete in preview
        if (liveText.value.trim() === '') {
            p.textContent = '';
        }
        updatePreview();
    });
    // Initialize preview with default text
    liveText.value = document.querySelector('.preview-box p')?.textContent || '';
    // Sync initial state
    const previewBox = document.getElementById('previewBox');
    let p = previewBox.querySelector('p');
    if (p) p.textContent = liveText.value;
}