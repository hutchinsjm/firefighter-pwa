export const Platform = (() => {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
  
    const isTouch =
      'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
  
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    const isAndroid = /android/i.test(ua);
    const isMobile = isIOS || isAndroid || (isTouch && window.innerWidth < 1024);
  
    const isDesktop = !isMobile;
    const isOffline = !navigator.onLine;
  
    return {
      isIOS,
      isAndroid,
      isMobile,
      isDesktop,
      isTouch,
      isOffline,
      isOnline: !isOffline,
    };
  })();
  