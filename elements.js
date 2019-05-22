(function() {
    // elements

    const IMG_CROPPER_ELEMENT = document.getElementById('imageCropper');
    const ELEMENTS = {
        CONTAINER: 'container',
        CONTROLS: 'controls',
        UPLOAD: 'upload',
        MAX_WIDTH: 'maxWidth',
        MAX_HEIGHT: 'maxHeight',
        IS_RECT: 'isRect',
        IS_ELLIPSE: 'isEllipse',
        SAVE: 'save',
        IMAGE: 'image',
        PRELOADER: 'preloader',
        NOTIFICATIONS: 'notifications'
    };

    const getElementAttributeSelector = element => `[data-element="${element}"]`;
    const NODES = Object.entries(ELEMENTS).reduce((acc, [key, elemName]) => {
        const selector = getElementAttributeSelector(elemName);
        return { ...acc, [key]: IMG_CROPPER_ELEMENT.querySelector(selector) };
    }, {});

    window.modules = {
        ...(window.modules || {}),
        elements: { ELEMENTS, NODES: { ...NODES, APP: IMG_CROPPER_ELEMENT } }
    };
}());