(function() {
    const defaultListener = () => {};
    const defaultCallback = () => () => {};
    const {
        elements: { ELEMENTS = {}, NODES = {} } = {},
        handlers: {
            uploadImage = defaultCallback,
            setMaxWidth = defaultCallback,
            setMaxHeight = defaultCallback,
            setIsEllipse = defaultCallback,
            setIsRect = defaultCallback,
            saveImage = defaultCallback,
            initImageCropper = defaultCallback,
            handleNotifications = defaultCallback,
            updateImageCropperForm = defaultListener,
            handlePreloader = defaultListener
        } = {},
        utils: { state, mediator }
    } = window.modules || {};

    mediator.subscribe(`${ELEMENTS.UPLOAD}-file`, initImageCropper(state));
    mediator.subscribe(`${ELEMENTS.IS_ELLIPSE}-value`, updateImageCropperForm);
    mediator.subscribe(`${ELEMENTS.SAVE}-isLoading`, handlePreloader);
    mediator.subscribe(`${ELEMENTS.NOTIFICATIONS}-notification`, handleNotifications(state));

    NODES.UPLOAD.addEventListener('change', uploadImage(state));
    NODES.MAX_WIDTH.addEventListener('change', setMaxWidth(state));
    NODES.MAX_HEIGHT.addEventListener('change', setMaxHeight(state));
    NODES.IS_ELLIPSE.addEventListener('click', setIsEllipse(state));
    NODES.IS_RECT.addEventListener('click', setIsRect(state));
    NODES.SAVE.addEventListener('click', saveImage(state));
}());
