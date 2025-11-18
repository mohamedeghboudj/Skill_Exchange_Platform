document.addEventListener('DOMContentLoaded', function () {
    index = 0;
    // other than default case , should be checked
    function getUserFromArray() {
        const userArray = fromLocalStorage()[index];
        return userArray;
    }


    const user = getUserFromArray();

    let NameValue = document.querySelector('#FullnameV'),
        ageValue = document.querySelector('#AgeV'),
        emailValue = document.querySelector('#emailV'),
        skillValue = document.querySelector('#skillV'),
        bioValue = document.querySelector('#bioV');





    NameValue.value = user.profile.name;
    ageValue.value = user.profile.age;
    emailValue.value = user.email;
    skillValue.value = user.profile.skill;
    bioValue.value = user.profile.bio;
})
let remove=document.getElementById("remove");
let mydialog=document.getElementById("popup");
remove.addEventListener('click',()=>{
    mydialog.showModal();
});
function closePop(){
    mydialog.close();
}
mydialog.addEventListener('click',()=>{
    
    mydialog.close();}
    
)

