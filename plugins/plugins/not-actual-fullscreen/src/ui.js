var buttonElementList = [];

export function NewPlayerButton(callback, icon, customIndex = 1) {
    setTimeout(() => {
        let iconHolder = document.querySelector("[class*=\"_moreContainer\"");

        let button = document.createElement("button");
        button.style.width = "32px";
        button.style.height = "32px";
        button.style.border = "none";
        button.classList.add("xcl_customButton");
        
        let buttonIcon = document.createElement("img");
        buttonIcon.src = icon;
        buttonIcon.style.width = "100%";
        buttonIcon.style.height = "100%";
        button.onclick = callback;
    
        button.appendChild(buttonIcon);
        
        const children = Array.from(iconHolder.children);
        if (customIndex <= children.length) {
            iconHolder.insertBefore(button, children[customIndex - 1]);
        } else {
            iconHolder.appendChild(button);
        }
    
        buttonElementList.push(button);
        return button;
    }, 1000);
}

export function CleanupButtons() {
    Array.from(buttonElementList).forEach(element => {
        element.remove();
    });

    Array.from(document.getElementsByClassName("xcl_customButton")).forEach(element => {
        element.remove();
    });
}