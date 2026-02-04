


const baseUrl = "https://tarmeezAcademy.com/api/v1"
let currentpage = 1
let lastPage = 1 
let isLoading = false // 1. مفتاح الأمان لمنع تكرار الطلبات

// INFINITE SCROLL // 
window.addEventListener("scroll", function() {
    // أضفنا هامش بسيط (5px) لضمان اشتغال الشرط بدقة
    const endOfPage = window.innerHeight + window.pageYOffset >= document.body.scrollHeight - 5;

    // أضفنا شرط !isLoading (أي: لا ترسل طلباً جديداً إذا كان هناك طلب قيد التنفيذ)
    if (endOfPage && currentpage < lastPage && !isLoading) {
        currentpage = currentpage + 1
        getPosts(false, currentpage)
    }
});







setupUI()
getPosts()



function userClicked(userId)
{
    window.location = `profile.html?userid=${userId}`
}




function getPosts(reload = true, page = 1) 
{ 
    toggleLoader(true)
    
    const postsDiv = document.getElementById("posts"); // تخزين العنصر في متغير

    // إذا لم يجد العنصر في الصفحة الحالية، توقف عن التنفيذ ولا تظهر خطأ
    if (!postsDiv) {
        return; 
    }

    isLoading = true; // 2. تفعيل القفل فور بدء الطلب

    axios.get(`${baseUrl}/posts?limit=6&page=${page}`)
    .then((response) => {
        toggleLoader(false)
        const posts = response.data.data
        lastPage = response.data.meta.last_page

        if (reload) {
            postsDiv.innerHTML = "";
        }

        let user = getCurrentUser()

        for (let post of posts) {
            const author = post.author
            let postTitle = post.title ? post.title : ""

            
            let isMyPost = user != null && post.author.id == user.id
            let editBtnContent = ``

            if(isMyPost){
                editBtnContent=
                `
                <div class="ms-auto">
                    <button id= "btn-delete" class="btn" onclick="deletePostBtnClicked('${encodeURIComponent(JSON.stringify(post))}')">delete</button>
                    <button class="btn btn-secondary" onclick="editPostBtnClicked('${encodeURIComponent(JSON.stringify(post))}')">edit</button>
                </div>
                `
            }


            let content = `
                <div class="card shadow mb-4">
                    <div class="card-header d-flex align-items-center">
                        <div onclick ="userClicked(${author.id})" style ="cursor: pointer;">
                            <img class="rounded-circle border border-2" src="${author.profile_image}" style="width: 40px; height: 40px;">
                            <b>${author.username}</b>
                        </div>
                        ${editBtnContent}
                        
                    </div>
                    <div class="card-body" onclick ="postClicked(${post.id})">
                        <img class="w-100" src="${post.image}" alt="">
                        <h6 class="mt-1" style="color: rgb(193, 193, 193);">${post.created_at}</h6>
                        <h5>${postTitle}</h5>
                        <p>${post.body}</p>
                        <hr>
                        <div>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pen" viewBox="0 0 16 16">
                                <path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001m-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708z"/>
                            </svg>
                            <span>(${post.comments_count}) Comments</span>
                            <span id="post-tags-${post.id}"></span>
                        </div>
                    </div>
                </div>
            `
            document.getElementById("posts").innerHTML += content
            
            const currentPostTagsId = `post-tags-${post.id}`
            document.getElementById(currentPostTagsId).innerHTML = ""

            for (let tag of post.tags) {
                let tagsContent = `<button class="btn btn-sm rounded-5" style="background-color:gray; color:white; font-weight: bold; margin-left: 5px;">${tag.name}</button>`
                document.getElementById(currentPostTagsId).innerHTML += tagsContent
            }
        }
    })
    .finally(() => {
        isLoading = false; // 3. فتح القفل بعد انتهاء الطلب (سواء نجح أو فشل)
    })
}



function loginBtnClicked()
{
    const username = document.getElementById("username-input").value
    const password = document.getElementById("password-input").value

    const params = {
        "username" : username,
        "password" : password
    }

    const url = `${baseUrl}/login`
    axios.post(url, params)
    .then((response) => {
        localStorage.setItem("token",response.data.token)
        localStorage.setItem("user",JSON.stringify(response.data.user))

        const modal =document.getElementById("login-modal")
        const modalInstance = bootstrap.Modal.getInstance(modal)
        modalInstance.hide()
        
        
        showAlert("logged in successfully","success")
        setupUI()
        getPosts();
    })

}


function registerBtnClicked() 
{
    const name = document.getElementById("register-name-input").value
    const username = document.getElementById("register-username-input").value
    const password = document.getElementById("register-password-input").value
        const image = document.getElementById("register-image-input").files[0]



    let formData = new FormData();
    formData.append("name", name);
    formData.append("username", username)
    formData.append("password", password)
    formData.append("image", image)


    const headers = {
        "content-Type": "multipart/form-data",
    }

    const url = `${baseUrl}/register`
    axios.post(url, formData, {
        headers: headers
    })


    .then((response) => {
        localStorage.setItem("token",response.data.token)
        localStorage.setItem("user",JSON.stringify(response.data.user))

        const modal =document.getElementById("register-modal")
        const modalInstance = bootstrap.Modal.getInstance(modal)
        modalInstance.hide()
        
        showAlert("New User Registered Successfully","success")
        setupUI()

    }).catch((error) => {
        let message = error.response.data.message
        showAlert(message ,"danger")
    })
}



function logout()
{
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    showAlert("logged out successfully","success")
    setupUI()
    getPosts(true,1);
}





    function postClicked(postId)
    {
        window.location = `post.html?postId=${postId}`

    }




function creatNewPostClicked() {
    const postId = document.getElementById("post-id-input").value;
    const isCreate = postId == null || postId == "";

    const title = document.getElementById("post-title-input").value;
    const body = document.getElementById("post-body-input").value;
    const image = document.getElementById("post-image-input").files[0];
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("body", body);
    if (image) formData.append("image", image);

    const headers = {
        "Authorization": `Bearer ${token}`
        // ملاحظة: axios يحدد Content-Type تلقائياً عند استخدام FormData، يفضل عدم وضعها يدوياً هنا لتجنب مشاكل الـ Boundary
    };

    let url = "";
    
    if (isCreate) {
        url = `${baseUrl}/posts`;
        axios.post(url, formData, { headers: headers })
            .then(() => handleSuccess("New Post Created"))
            .catch(error => showAlert(error.response.data.message, "danger"));
    } else {
        // الحل السحري لمشكلة الـ undefined في التعديل:
        formData.append("_method", "put"); 
        url = `${baseUrl}/posts/${postId}`;

        // نستخدم POST بدلاً من PUT لأننا نرسل صورة (FormData)
        axios.post(url, formData, { headers: headers })
            .then(() => handleSuccess("Post Updated Successfully"))
            .catch(error => showAlert(error.response.data.message, "danger"));
    }
}

// دالة مساعدة لتنظيف الكود
function handleSuccess(message) {
    const modal = document.getElementById("create-post-modal");
    const modalInstance = bootstrap.Modal.getInstance(modal);
    if (modalInstance) modalInstance.hide();
    showAlert(message, "success");
    getPosts();
}





    function editPostBtnClicked(postObject)
    {
        let post = JSON.parse(decodeURIComponent(postObject))
        console.log(post)

        document.getElementById("post-modal-submit-btn").innerHTML ="Update"
        document.getElementById("post-id-input").value = post.id
        document.getElementById("post-modal-title").innerHTML = "Edit Post"
        document.getElementById("post-title-input").value = post.title
        document.getElementById("post-body-input").value = post.body
        let postModal = new bootstrap.Modal(document.getElementById("create-post-modal"),{})
        postModal.toggle()
    }






    
    function addBtnClicked() 
    {

        document.getElementById("post-modal-submit-btn").innerHTML ="Create"
        document.getElementById("post-id-input").value = ""
        document.getElementById("post-modal-title").innerHTML = "Create A New Post"
        document.getElementById("post-title-input").value = ""
        document.getElementById("post-body-input").value = ""
        let postModal = new bootstrap.Modal(document.getElementById("create-post-modal"),{})
        postModal.toggle()
    }



    


    function deletePostBtnClicked(postObject)
    {
        let post = JSON.parse(decodeURIComponent(postObject))
        console.log(post)

        document.getElementById("delete-post-id-input").value =post.id
        let postModal = new bootstrap.Modal(document.getElementById("delete-post-modal"),{})
        postModal.toggle()
    }





    function confirmPostDelete()
    {
        const token = localStorage.getItem("token")
        const postId = document.getElementById("delete-post-id-input").value
        const url = `${baseUrl}/posts/${postId}`
        const headers = {
            "content-Type": "multipart/form-data",
            "authorization": `Bearer ${token}`
        }

        axios.delete(url,{
            headers: headers
        })
        .then((response) => {
            
            const modal = document.getElementById("delete-post-modal")
            const modalInstance = bootstrap.Modal.getInstance(modal)
            modalInstance.hide()
            showAlert("The Post Has Been Deleted Successfully","success")
            getPosts()
        }).catch((error) => {
            const message = error.response.data.message 
            showAlert(message,"danger")
        })
    }





        function showAlert(customMessage, type)
        {
            const alertPlaceholder = document.getElementById('success-alert')
            const Alert = (message, type) => {
            const wrapper = document.createElement('div')
            wrapper.innerHTML = [
                `<div class="alert alert-${type} alert-dismissible" role="alert">`,
                `   <div>${message}</div>`,
                '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
                '</div>'
            ].join('')

            alertPlaceholder.append(wrapper)
            }
            
            Alert(customMessage,type)

            setTimeout(() => {
        const alertElement = document.querySelector('.alert');
        if (alertElement) {
            const bsAlert = bootstrap.Alert.getOrCreateInstance(alertElement);
            bsAlert.close();
        }
    }, 2000); 
        }







        function pofileClicked()
        {
            const user = getCurrentUser()
            const userId = user.id
            window.location = `profile.html?userid=${userId}`
        }






        function setupUI()
        {
            const token =localStorage.getItem("token")

            const loginDiv = document.getElementById("logged-in-div")
            const logoutDiv = document.getElementById("logout-div")

            const addBtn = document.getElementById("add-btn")

            if(token == null) //user is guest (not logged in)
        {
            if(addBtn != null)
            {
                addBtn.style.setProperty("display","none","important")
            }
            loginDiv.style.setProperty("display","flex","important")
            logoutDiv.style.setProperty("display","none","important")
        }else{
            if(addBtn != null)
            {
                addBtn.style.setProperty("display","block","important")
            }
            loginDiv.style.setProperty("display","none","important")
            logoutDiv.style.setProperty("display","flex","important")

            const user = getCurrentUser()
            document.getElementById("nav-username").innerHTML = user.username
            document.getElementById("nav-user-image").src = user.profile_image
            }
        }

    function getCurrentUser()
    {
        let user = null
        const storageUser = localStorage.getItem("user")

        if(storageUser != null)
        {
            user = JSON.parse(storageUser)
        }
        return user
    }






    function toggleLoader(show = true)
    {
        if(show)
        {
            document.getElementById("loader").style.visibility = 'visble'
        }else {
            document.getElementById("loader").style.visibility = 'hidden'
        }
    }