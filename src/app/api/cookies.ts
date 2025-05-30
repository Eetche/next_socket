type CookieArgs = string & any;

export function setCookie(name: CookieArgs, value: CookieArgs) {
  if (typeof document !== "undefined") {
    document.cookie = `${name}=${value}`;
  }
}

export function getCookie(name: CookieArgs) {
    if (typeof document !== "undefined") {
        let matches = document.cookie.match(new RegExp(
          "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return (matches ? decodeURIComponent(matches[1]) : undefined) as any;
        // just copy paste function for get cookie by name
      }
}
