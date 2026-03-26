document.addEventListener('DOMContentLoaded', () => {
    if (window.parent !== window) {
        window.parent.postMessage(
            {
                type: 'iframe_height',
                height: document.documentElement.scrollHeight
            },
            '*'
        );
    }
});
