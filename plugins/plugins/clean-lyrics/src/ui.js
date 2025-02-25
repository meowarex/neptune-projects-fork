export function NewPlayerButton(callback, iconSource)   {
    let buttonContainer = document.querySelector("[class*=\"moreContainer--\"]");
    if (buttonContainer) {
        let buttonElement = document.createElement("button");
        buttonElement.style.height = "32px"
        buttonElement.style.width = "32px"
        buttonElement.style.display = "flex";
        buttonElement.style.border = "none";
        buttonElement.style.backgroundColor = "transparent";
        buttonElement.style.verticalAlign = "middle";

        let buttonIcon = document.createElement("img");
        buttonIcon.src = iconSource;
        buttonIcon.style.backgroundColor = "transparent";

        buttonElement.onclick = callback;

        buttonElement.appendChild(buttonIcon);
        buttonContainer.appendChild(buttonElement);
    }
}