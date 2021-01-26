export const styleColors = `
:root {
    --fg-color: #eeeeee;
    --fg-color-2nd: #aaaaaa;
    --bg-color: #222831;
    --bg-color-2nd: #222831;

    --widget-fg-color: #eeeeee;
    --widget-fg-color-2nd: #aaaaaa;
    --widget-bg-color: #222831;
    --widget-border-color: #393e46;
}
`;

export const styleReset = `
:host {
    display: block;
    font-family: system-ui;
    font-size: 12px;
    line-height: 1.4;
}
:host * {
    box-sizing: border-box;
}
h1, h2, h3 {
    font-size: 16px;
}
h4, h5, h6 {
    font-size: 14px;
}
a {
    color: inherit;
    text-decoration: none;
}
a:hover {
    text-decoration: underline;
}
img {
    display: inline-block;
}
input {
    -moz-appearance: none;
    -webkit-appearance: none;
    appearance: none;
    outline: none;
    line-height: 1;
    font-size: 14px;
}
`;
