(function() {
    // handlers

    const { elements: { ELEMENTS = {}, NODES = {} } = {} } = window.modules || {};

    function uploadImage(stateObject) {
        if (!stateObject.has(ELEMENTS.UPLOAD)) {
            stateObject.init(ELEMENTS.UPLOAD);
        }

        return ({ target: { files } }) => {
            const reader = new FileReader();
            const file = files[0];

            reader.onloadend = () => {
                stateObject.data[ELEMENTS.UPLOAD].set('file', reader.result);
            };

            if (file) {
                reader.readAsDataURL(file);
            }
        };
    }

    function initImageCropper(stateObject) {
        return (file) => {
            const uploadData = stateObject.data[ELEMENTS.UPLOAD];

            if (uploadData.cropper) {
                uploadData.cropper.replace(file);
            } else {
                NODES.IMAGE.src = file;
                uploadData.set('cropper', new Cropper(NODES.IMAGE));
            }
        };
    }

    function updateImageCropperForm(isEllipse) {
        const isNowEllipse = NODES.APP.classList.contains('image-cropper--ellipse');
        
        if (isEllipse && isNowEllipse || !isEllipse && !isNowEllipse) return;
        
        if (isEllipse) {
            NODES.APP.classList.add('image-cropper--ellipse');
        } else {
            NODES.APP.classList.remove('image-cropper--ellipse');
        }
    }

    function setMaxWidth(stateObject) {
        if (!stateObject.has(ELEMENTS.MAX_WIDTH)) {
            stateObject.init(ELEMENTS.MAX_WIDTH);
        }

        return ({ target: { value } }) => {
            stateObject.data[ELEMENTS.MAX_WIDTH].set('value', value);
        };
    }

    function setMaxHeight(stateObject) {
        if (!stateObject.has(ELEMENTS.MAX_HEIGHT)) {
            stateObject.init(ELEMENTS.MAX_HEIGHT);
        }

        return ({ target: { value } }) => {
            stateObject.data[ELEMENTS.MAX_HEIGHT].set('value', value);
        };
    }

    function setIsEllipse(stateObject) {
        if (!stateObject.has(ELEMENTS.IS_ELLIPSE)) {
            stateObject.init(ELEMENTS.IS_ELLIPSE);
        }

        return () => {
            stateObject.data[ELEMENTS.IS_ELLIPSE].set('value', true);
        };
    }

    function setIsRect(stateObject) {
        if (!stateObject.has(ELEMENTS.IS_ELLIPSE)) {
            stateObject.init(ELEMENTS.IS_ELLIPSE);
        }

        return () => {
            stateObject.data[ELEMENTS.IS_ELLIPSE].set('value', false);
        };
    }

    function saveImage(stateObject) {
        if (!stateObject.has(ELEMENTS.SAVE)) {
            stateObject.init(ELEMENTS.SAVE);
        }

        return () => {
            if (!stateObject.data[ELEMENTS.UPLOAD].cropper) {
                stateObject.data[ELEMENTS.NOTIFICATIONS].set('notification', {
                    type: 'fail',
                    message: 'No image to save'
                });
                return;
            }

            stateObject.data[ELEMENTS.SAVE].set('isLoading', true);

            cropImage(stateObject);

            const maxWidth = stateObject.data[ELEMENTS.MAX_WIDTH].value || Infinity;
            const maxHeight = stateObject.data[ELEMENTS.MAX_HEIGHT].value || Infinity;

            const handleImgReady = () => {
                const imgData = stateObject.data[ELEMENTS.UPLOAD].cropper.getCroppedCanvas({
                    maxWidth, maxHeight
                });
    
                imgData.toBlob((blob) => {
                    const body = new FormData();
                    body.append('croppedImage', blob);
    
                    fetch('http://localhost:8080', {
                        method: 'POST',
                        header: {
                            'Content-Type': 'multipart/form-data'
                        },
                        body
                    })
                        .then(() => {
                            stateObject.data[ELEMENTS.SAVE].set('isLoading', false);
                            stateObject.data[ELEMENTS.NOTIFICATIONS].set('notification', {
                                type: 'success', message: '✔ The image successfully saved'
                            });
                        })
                        .catch(() => {
                            stateObject.data[ELEMENTS.SAVE].set('isLoading', false);
                            stateObject.data[ELEMENTS.NOTIFICATIONS].set('notification', {
                                type: 'fail', message: 'Error. Couldn\'t save the image'
                            });
                        });
                });

                NODES.IMAGE.removeEventListener('ready', handleImgReady);
            };

            NODES.IMAGE.addEventListener('ready', handleImgReady);           
        };
    }

    function cropImage(stateObject) {
        const isEllipse = stateObject.data[ELEMENTS.IS_ELLIPSE].value;

        if (!stateObject.data[ELEMENTS.UPLOAD] || !stateObject.data[ELEMENTS.UPLOAD].cropper) return null;

        const cropper = stateObject.data[ELEMENTS.UPLOAD].cropper;
        const { x, y, width, height } = cropper.getData();
        const croppedImage = cropper.getCroppedCanvas();
        const croppedCanvas = isEllipse ? getCroppedEllipseCanvas(
            croppedImage, x, y, width, height
        ) : croppedImage;

        const dataUrl = croppedCanvas.toDataURL('image/png');

        initImageCropper(stateObject)(dataUrl);
    }

    function getCroppedEllipseCanvas(image, x, y, width, height) {
        const canvas = document.createElement('canvas');
        canvas.setAttribute('width', width);
        canvas.setAttribute('height', height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);
        ctx.save();
        ctx.globalCompositeOperation="destination-in";
        ctx.ellipse(width / 2, height / 2, width / 2, height / 2, 0, 0, 360);
        ctx.fill();
        ctx.restore();
        
        return canvas;
    }

    function handlePreloader(value) {
        const preloaderClasses = NODES.PRELOADER.classList;
        if (
            value && preloaderClasses.contains('image-cropper__preloader--visible') ||
            !value && !preloaderClasses.contains('image-cropper__preloader--visible')
        ) return;
        
        if (value) {
            preloaderClasses.add('image-cropper__preloader--visible');
        } else {
            preloaderClasses.remove('image-cropper__preloader--visible');
        }
    }

    function handleNotifications(stateObject) {
        if (!stateObject.has(ELEMENTS.NOTIFICATIONS)) {
            stateObject.init(ELEMENTS.NOTIFICATIONS);
        }

        let timeoutId = null;

        return ({ type, message }) => {
            clearInterval(timeoutId);
            NODES.NOTIFICATIONS.innerHTML = '';

            const notification = document.createElement('div');
            notification.classList.add('image-cropper__notification');
            notification.classList.add(`image-cropper__notification--${type}`);
            notification.innerHTML = message;

            NODES.NOTIFICATIONS.appendChild(notification);

            timeoutId = setTimeout(() => {
                NODES.NOTIFICATIONS.innerHTML = '';
                timeoutId = null;
            }, 4000);
        };
    }

    window.modules = {
        ...(window.modules || {}),
        handlers: {
            uploadImage, setMaxWidth, setMaxHeight,
            setIsEllipse, setIsRect, saveImage,
            initImageCropper, updateImageCropperForm,
            handlePreloader, handleNotifications
        }
    };
}());