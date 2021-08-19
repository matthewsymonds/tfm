export const Fonts = () => (
    <>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
            href="https://fonts.googleapis.com/css2?family=Ubuntu+Condensed:wght@400;500;600;700;900&family=Open+Sans:wght@400;500;600;700;900"
            rel="preload"
            id="preload-stylesheet"
            as="style"
            onLoad={function () {
                const element = document.querySelector('#preload-stylesheet');
                if (element && element instanceof HTMLLinkElement) {
                    element.rel = 'stylesheet';
                }
            }}
            crossOrigin="anonymous"
        />
        <link
            href="https://fonts.googleapis.com/css2?family=Ubuntu+Condensed:wght@400;500;600;700;900&family=Open+Sans:wght@400;500;600;700;900"
            rel="stylesheet"
            crossOrigin="anonymous"
        />
    </>
);
