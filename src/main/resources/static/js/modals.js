import { $ } from "./utils.js";


// =========================================
// OPEN MODAL
// =========================================

export function openModal(id) {

    const modal = $(`#${id}`);

    if (!modal) {

        console.error(
            `Modal topilmadi: ${id}`
        );

        return;
    }

    modal.classList.add("open");
}


// =========================================
// CLOSE MODAL
// =========================================

export function closeModal(id) {

    const modal = $(`#${id}`);

    if (!modal) {

        console.error(
            `Yopiladigan modal topilmadi: ${id}`
        );

        return;
    }

    modal.classList.remove("open");
}


// =========================================
// INIT MODALS
// =========================================

export function initModals() {


    // -----------------------------------------
    // X / CLOSE BUTTONS
    // -----------------------------------------

    document
        .querySelectorAll(".modal-close")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const modalId =
                        button.dataset.close ||
                        button.dataset.closeModal;

                    if (!modalId) {

                        console.error(
                            "Modal yopish ID topilmadi:",
                            button
                        );

                        return;
                    }

                    closeModal(modalId);

                }
            );

        });


    // -----------------------------------------
    // OTHER CLOSE BUTTONS
    // -----------------------------------------

    document
        .querySelectorAll(
            "[data-close], [data-close-modal]"
        )
        .forEach(button => {

            // .modal-close yuqorida allaqachon
            // event olgan bo'lsa qayta qo'shmaymiz

            if (
                button.classList.contains(
                    "modal-close"
                )
            ) {
                return;
            }


            button.addEventListener(
                "click",
                () => {

                    const modalId =
                        button.dataset.close ||
                        button.dataset.closeModal;

                    if (!modalId) return;

                    closeModal(modalId);

                }
            );

        });


    // -----------------------------------------
    // MODAL BACKDROP CLICK
    // -----------------------------------------

    document
        .querySelectorAll(".modal")
        .forEach(modal => {

            modal.addEventListener(
                "click",
                event => {

                    if (
                        event.target === modal
                    ) {

                        modal.classList.remove(
                            "open"
                        );

                    }

                }
            );

        });


    // -----------------------------------------
    // ESCAPE
    // -----------------------------------------

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key !== "Escape"
            ) {
                return;
            }


            document
                .querySelectorAll(
                    ".modal.open"
                )
                .forEach(modal => {

                    modal.classList.remove(
                        "open"
                    );

                });

        }
    );

}