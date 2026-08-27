import { $ } from "./utils.js";

export function openModal(id) {
    const modal = $(`#${id}`);

    if (!modal) {
        console.error(`Modal topilmadi: ${id}`);
        return;
    }

    modal.classList.add("open");
}

export function closeModal(id) {
    const modal = $(`#${id}`);

    if (!modal) return;

    modal.classList.remove("open");
}

export function initModals() {

    document.querySelectorAll(".modal-close")
        .forEach(button => {

            button.addEventListener("click", () => {
                closeModal(button.dataset.close);
            });

        });

    document.querySelectorAll(".modal")
        .forEach(modal => {

            modal.addEventListener("click", event => {

                if (event.target === modal) {
                    modal.classList.remove("open");
                }

            });

        });
}