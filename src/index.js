import $ from "jquery";
import * as jose from "jose";
import Fuse from "fuse.js";

// Vidstack Player for HLS video playback - https://vidstack.io/
import { VidstackPlayer, VidstackPlayerLayout } from "vidstack/global/player";

const serverHost = "http://localhost:5001";

const fileList = $("#fileList");
const fileUploadInput = $("#file-upload");
const fileUploadButton = $("#submit-file");
const progressBar = $("#progress-bar");
const progressBarFill = $("#progress-bar-fill");
const progressBarText = $("#progress-bar-text");
const searchIcon = $("#search-icon");
const searchInput = $("#searchbar");

const dropArea = document.getElementById("drop-area");
const preview = document.getElementById("preview");

const gridButton = $("#grid-style");
const listButton = $("#list-style");

const themeButton = $("#theme");

let currentPath = [];

let fileUploadingProgress = [
  {
    file: "exampleFile",
    type: "txt",
    process: "uploading",
    progress: 70,
  },
  {
    file: "exampleFile2",
    type: "pdf",
    process: "uploading",
    progress: 45,
  },
  {
    file: "exampleFile3",
    type: "zip",
    process: "uploading",
    progress: 20,
  },
  {
    file: "exampleFile4",
    type: "txt",
    process: "download",
    progress: 98,
  },
];

// Open Source Icons from heroicons - https://heroicons.com/
const folderIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
</svg>
`;

const generalFileIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
</svg>
`;

const textFileIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
</svg>
`;

const uploadFileIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
</svg>
`;

const generalDownloadIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
</svg>
`;

const folderDownloadIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="m9 13.5 3 3m0 0 3-3m-3 3v-6m1.06-4.19-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
</svg>
`;

const trashIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
</svg>
`;

const imageIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
</svg>
`;

const animatedImageIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M12.75 8.25v7.5m6-7.5h-3V12m0 0v3.75m0-3.75H18M9.75 9.348c-1.03-1.464-2.698-1.464-3.728 0-1.03 1.465-1.03 3.84 0 5.304 1.03 1.464 2.699 1.464 3.728 0V12h-1.5M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
</svg>
`;

const filmIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0 1 18 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0 1 18 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 0 1 6 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25C6 11.496 5.496 12 4.875 12M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m-12 5.25v-5.25m0 5.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125m-12 0v-1.5c0-.621-.504-1.125-1.125-1.125M18 18.375v-5.25m0 5.25v-1.5c0-.621.504-1.125 1.125-1.125M18 13.125v1.5c0 .621.504 1.125 1.125 1.125M18 13.125c0-.621.504-1.125 1.125-1.125M6 13.125v1.5c0 .621-.504 1.125-1.125 1.125M6 13.125C6 12.504 5.496 12 4.875 12m-1.5 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M19.125 12h1.5m0 0c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h1.5m14.25 0h1.5" />
</svg>
`;

const songIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="m9 9 10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66a2.25 2.25 0 0 0 1.632-2.163Zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 0 1-.99-3.467l2.31-.66A2.25 2.25 0 0 0 9 15.553Z" />
</svg>
`;

const archiveIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
</svg>
`;

const backIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
</svg>
`;

const codeIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
</svg>
`;

const textIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
</svg>
`;

const executableIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
</svg>
`;

const fontIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
</svg>
`;

const presentationIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
</svg>
`;

const spreadsheetIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0 1 12 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 1.5v-1.5m0 0c0-.621.504-1.125 1.125-1.125m0 0h7.5" />
</svg>
`;

const moon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
</svg>
`;

const sun = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
</svg>
`;

const computerGeneric = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
</svg>
`;

const discIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
</svg>
`;

const videoFileTypes = [
  "mp4",
  "mov",
  "avi",
  "mkv",
  "webm",
  "flv",
  "wmv",
  "mpg",
];
const audioFileTypes = ["mp3", "wav", "flac", "aac", "ogg"];
const imageFileTypes = ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"];
const textFileTypes = ["txt", "md", "doc", "docx", "pdf", "rtf"];
const archiveFileTypes = ["zip", "rar", "7z", "tar", "gz", "bz2"];
const codeFileTypes = [
  "html",
  "css",
  "js",
  "ts",
  "jsx",
  "tsx",
  "py",
  "java",
  "c",
  "cpp",
  "cs",
  "php",
  "rb",
  "go",
  "swift",
  "kt",
  "sh",
  "bat",
  "ps1",
];
const documentFileTypes = [
  "doc",
  "docx",
  "pdf",
  "rtf",
  "odt",
  "xls",
  "xlsx",
  "ods",
  "ppt",
  "pptx",
  "odp",
];
const executableFileTypes = ["exe", "msi", "apk", "app", "bat", "sh"];
const fontFileTypes = ["ttf", "otf", "woff", "woff2", "eot"];
const presentationFileTypes = ["ppt", "pptx", "odp"];
const spreadsheetFileTypes = ["xls", "xlsx", "ods"];
const discImageFileTypes = ["iso", "img", "dmg", "vhd", "vmdk"];

const fuseOptions = {
  // isCaseSensitive: false,
  // includeScore: false,
  // shouldSort: true,
  // includeMatches: false,
  // findAllMatches: false,
  // minMatchCharLength: 1,
  // location: 0,
  // threshold: 0.6,
  // distance: 100,
  // useExtendedSearch: false,
  // ignoreLocation: false,
  // ignoreFieldNorm: false,
  // fieldNormWeight: 1,
  keys: [
    { name: "name", weight: 0.8 },
    { name: "type", weight: 0.5 },
    { name: "path", weight: 0.3 },
  ],
};

function LoginUser(token) {
  const decodedToken = jose.decodeJwt(token);
  localStorage.setItem("session_token", token);
  localStorage.setItem("username", decodedToken.username);
  localStorage.setItem("logged_in", decodedToken.logged_in);
}

function submitLogin() {
  fileList.empty();

  const username = $("#username").val();
  const password = $("#password").val();

  const data = { username: username, password: password };

  fetch(`${serverHost}/login`, {
    credentials: "include",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "access-control-allow-origin": "*",
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (!response.ok) {
        throw Error(response.statusText);
      }

      return response.json();
    })
    .then((data) => {
      document.getElementById("response").textContent = data.message;
      if (data.token) {
        localStorage.setItem("session_token", data.token);
        localStorage.setItem("username", username);
        localStorage.setItem("password", password);
        localStorage.setItem("logged_in", "true");

        fileList.empty();
        LoginUser(data.token);

        location.reload();
      } else {
        localStorage.removeItem("session_token");
        localStorage.removeItem("username");
        localStorage.removeItem("password");
        localStorage.removeItem("logged_in");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      localStorage.removeItem("session_token");
      localStorage.removeItem("username");
      localStorage.removeItem("password");
      localStorage.removeItem("logged_in");
    });
}

function CheckLoggedIn() {
  const token = localStorage.getItem("session_token");
  const username = localStorage.getItem("username");
  const password = localStorage.getItem("password");
  const logged_in = localStorage.getItem("logged_in");

  if (token && username && password && logged_in) {
    const decodedToken = jose.decodeJwt(token);

    const logged_in_boolean = logged_in === "true";
    if (
      decodedToken.username === username &&
      decodedToken.logged_in === logged_in_boolean
    ) {
      return true;
    } else {
      return false;
    }
  }

  return false;
}

function submitRegister() {
  const username = $("#username").val();
  const password = $("#password").val();

  const data = { username: username, password: password };

  fetch(`${serverHost}/register`, {
    credentials: "include",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "access-control-allow-origin": "*",
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (!response.ok) {
        throw Error(response.statusText);
      }

      return response.json();
    })
    .then((data) => {
      document.getElementById("response").textContent = data.message;

      if (response.ok) {
        localStorage.removeItem("session_token");
        localStorage.removeItem("username");
        localStorage.removeItem("password");
        localStorage.removeItem("logged_in");
        localStorage.removeItem("user_directory");
        fileList.empty();
        submitLogin();
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });

  return false;
}

function RequestUserData(dataRequest) {
  if (CheckLoggedIn()) {
    switch (dataRequest) {
      case "username":
        return localStorage.getItem("username");
      case "password":
        return localStorage.getItem("password");
      case "logged_in":
        return localStorage.getItem("logged_in");
      default:
        return null;
    }
  }
}

function LogoutUser() {
  localStorage.removeItem("session_token");
  localStorage.removeItem("username");
  localStorage.removeItem("password");
  localStorage.removeItem("logged_in");

  location.reload();
}

if (document.getElementById("login-form")) {
  const submitLoginButton = $("#submit-login");
  const submitRegisterButton = $("#submit-register");
  submitLoginButton.click(submitLogin);
  submitRegisterButton.click(submitRegister);
}

function DownloadFile(file_path) {
  if (CheckLoggedIn()) {
    const token = localStorage.getItem("session_token");
    const password = localStorage.getItem("password");
    const data = { token: token, password: password };

    fetch(`${serverHost}/download/${file_path}`, {
      credentials: "include",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "access-control-allow-origin": "*",
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (!response.ok) {
          throw Error(response.statusText);
        }

        const totalSize = Number(response.headers.get("Content-Length"));

        const reader = response.body.getReader();
        let downloadedSize = 0;

        let chunks = [];

        return reader.read().then(function process({ done, value }) {
          if (done) {
            const blob = new Blob(chunks);
            return blob;
          }

          chunks.push(value);

          downloadedSize += value.length;

          const progress = (downloadedSize / totalSize) * 100;
          updateProgressBar(progress);

          return reader.read().then(process);
        });
      })
      .then((data) => {
        const url = window.URL.createObjectURL(data);
        const a = document.createElement("a");

        updateProgressBar(0);

        a.href = url;
        a.download = file_path.split("/").pop();
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch((error) => {
        console.error("Error:", error);
        updateProgressBar(0);
      });

    return true;
  }

  updateProgressBar(0);
  return false;
}

function UploadFile() {
  if (CheckLoggedIn()) {
    const token = localStorage.getItem("session_token");
    const password = localStorage.getItem("password");
    const files = fileUploadInput[0].files;
    const path = currentPath.join("/");
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();

      formData.append("file", file);
      formData.append("path", path);
      formData.append("token", token);
      formData.append("password", password);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${serverHost}/upload`, true);

      xhr.upload.onprogress = function (event) {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          updateProgressBar(progress);
        }
      };

      xhr.onload = function () {
        if (xhr.status === 200) {
          ReturnUserDirectory();
          ListFileElements(RequestUserDirectory(), currentPath.join("/"));
          updateProgressBar(0);
        } else {
          console.error(`Failed to upload file ${file.name}`);
        }
      };

      xhr.onerror = function () {
        console.error(`Error: ${xhr.statusText}`);
        updateProgressBar(0);
      };

      xhr.send(formData);
    }
    ReturnUserDirectory();
    ListFileElements(RequestUserDirectory(), currentPath.join("/"));
    updateProgressBar(0);
  }
}

function ReturnUserDirectory() {
  if (CheckLoggedIn()) {
    const token = localStorage.getItem("session_token");
    const password = localStorage.getItem("password");
    const data = { token: token, password: password };
    let userDir = null;

    fetch(`${serverHost}/directory`, {
      credentials: "include",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "access-control-allow-origin": "*",
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (!response.ok) {
          throw Error(response.statusText);
        }

        userDir = response.json();
        return userDir;
      })
      .then((data) => {
        localStorage.setItem("user_directory", JSON.stringify(data));
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
}

function RequestUserDirectory() {
  if (CheckLoggedIn()) {
    ReturnUserDirectory();
    const userDirectory = JSON.parse(localStorage.getItem("user_directory"));
    return userDirectory;
  }
}

function RequestDirectory(path, userDirectory) {
  const pathArray = path.split("/");
  const userDir = userDirectory;
  let requestedDir = userDir;

  for (let i = 0; i < pathArray.length; i++) {
    const folderName = pathArray[i];
    for (let j = 0; j < requestedDir.children.length; j++) {
      const file = requestedDir.children[j];
      if (file.name === folderName) {
        requestedDir = file;
        break;
      }
    }
  }

  return requestedDir;
}

function DeleteFile(file_path) {
  if (CheckLoggedIn()) {
    const token = localStorage.getItem("session_token");
    const password = localStorage.getItem("password");
    const data = { token: token, password: password, file_path: file_path };

    fetch(`${serverHost}/delete`, {
      credentials: "include",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "access-control-allow-origin": "*",
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (!response.ok) {
          throw Error(response.statusText);
        }

        return response.json();
      })
      .then((data) => {
        ListFileElements(RequestUserDirectory(), currentPath.join("/"));
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
}

function CreateFileElement(currentFolder, i, path = currentPath) {
  console.log([
    "CreateFileElement",
    currentFolder,
    i,
    path,
    currentPath,
    currentFolder.children[i],
  ]);
  const file = currentFolder.children[i];
  const fileType = file.file_type;
  const fileName = file.name;
  const type = file.type;

  const fileElement = document.createElement("div");
  fileElement.className = "file";
  fileList.append(fileElement);

  const fileIcon = document.createElement("div");
  fileIcon.className = "fileIcon";
  fileElement.append(fileIcon);

  const fileInfo = document.createElement("div");
  fileInfo.className = "fileInfo";
  fileElement.append(fileInfo);

  const fileNameElement = document.createElement("h2");
  fileNameElement.className = "fileName";
  fileNameElement.textContent = fileName;
  fileInfo.append(fileNameElement);

  const deleteButton = document.createElement("button");
  deleteButton.className = "deleteButton";
  deleteButton.innerHTML = trashIcon;
  deleteButton.addEventListener("click", function () {
    DeleteFile(path.concat(fileName).join("/"))
      .then((response) => {
        if (response.ok) {
          fileElement.remove();
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });
  fileInfo.appendChild(deleteButton);

  switch (type) {
    case "folder":
      fileIcon.innerHTML = folderIcon;
      const folderElement = document.createElement("div");
      folderElement.className = "folder";
      fileElement.appendChild(folderElement);

      fileElement.addEventListener("click", function () {
        currentPath = path.concat(fileName);
        ListFileElements(file, currentPath.join("/"));
      });
      break;
    case "file":
      let fileIconElement;
      fileIconElement = document.createElement("div");

      function GetFileIcon(fileType, fileIconElement) {
        // Compare the file type to the different lists of file types to determine which icon to use, if the file type is not found, use the generic file icon.
        if (videoFileTypes.includes(fileType)) {
          fileIconElement.innerHTML = filmIcon;
        }
        if (audioFileTypes.includes(fileType)) {
          fileIconElement.innerHTML = audioIcon;
        }
        if (imageFileTypes.includes(fileType)) {
          fileIconElement.innerHTML = imageIcon;
        }
        if (textFileTypes.includes(fileType)) {
          fileIconElement.innerHTML = textIcon;
        }
        if (archiveFileTypes.includes(fileType)) {
          fileIconElement.innerHTML = archiveIcon;
        }
        if (codeFileTypes.includes(fileType)) {
          fileIconElement.innerHTML = codeIcon;
        }
        if (documentFileTypes.includes(fileType)) {
          fileIconElement.innerHTML = generalFileIcon;
        }
        if (executableFileTypes.includes(fileType)) {
          fileIconElement.innerHTML = executableIcon;
        }
        if (fontFileTypes.includes(fileType)) {
          fileIconElement.innerHTML = fontIcon;
        }
        if (presentationFileTypes.includes(fileType)) {
          fileIconElement.innerHTML = presentationIcon;
        }
        if (spreadsheetFileTypes.includes(fileType)) {
          fileIconElement.innerHTML = spreadsheetIcon;
        }
        if (discImageFileTypes.includes(fileType)) {
          fileIconElement.innerHTML = discIcon;
        }
        if (!fileIconElement.innerHTML) {
          fileIconElement.innerHTML = fileIcon;
        }
      }

      GetFileIcon(fileType, fileIconElement);

      fileIcon.appendChild(fileIconElement);

      fileElement.addEventListener("mouseover", function () {
        fileIconElement.innerHTML = generalDownloadIcon;
      });

      fileElement.addEventListener("mouseout", function () {
        GetFileIcon(fileType, fileIconElement);
      });

      fileElement.addEventListener("click", function () {
        if (fileType === "folder") {
          currentPath = path.concat(fileName);
          ListFileElements(file, currentPath.join("/"));
        } else {
          DownloadFile(path.concat(fileName).join("/"));
        }
      });
      break;
  }
}

function ListFileElements(fileDirectory, path = currentPath) {
  fileList.empty();
  ReturnUserDirectory();
  try {
    path = path.replace(/^\/|\/$/g, "").split("/");
    if (path[0] === "") {
      path.shift();
    }
  } catch (error) {
    console.error("Error:", error);
  }

  const currentFolder = fileDirectory;

  if (path.length > 1 || (path.length === 1 && path[0] !== "")) {
    const backButton = document.createElement("button");
    backButton.innerHTML = backIcon;
    backButton.className = "backButton";
    backButton.addEventListener("click", function () {
      const parentPath = path.slice(0, path.length - 1);
      currentPath = parentPath;
      const parentDirectory = RequestDirectory(
        parentPath.join("/"),
        RequestUserDirectory()
      );
      ListFileElements(parentDirectory, parentPath.join("/"));
    });
    fileList.append(backButton);
  }

  if (currentFolder && currentFolder.children) {
    for (var i = 0; i < currentFolder.children.length; i++) {
      CreateFileElement(currentFolder, i, path);
    }
  }
}

function updateProgressBar(progress) {
  if (!progress) {
    progress = 0;
  }

  const roundedProgress = Math.round(progress);

  if (roundedProgress >= 0 && roundedProgress < 100) {
    progressBar.css("display", "block");
  } else {
    progressBar.css("display", "none");
  }

  progressBarFill.css("width", `${progress}%`);
  progressBarText.text(`${roundedProgress}%`);

  if (progress < 50) {
    progressBarFill.css("background-color", "var(--accent-primary)");
  } else if (progress < 80) {
    progressBarFill.css("background-color", "var(--accent-secondary)");
  } else {
    progressBarFill.css("background-color", "var(--accent-tertiary)");
  }

  if (progress >= 100) {
    progressBarFill.css("width", "0%");
    progressBarText.text("0%");
    progressBar.css("display", "none");
  }

  if (progress === 0) {
    progressBar.css("display", "none");
  } else {
    progressBar.css("display", "block");
  }
}

function SortFiles(sortType) {
  switch (sortType) {
    case "grid":
      fileList.addClass("grid");
      localStorage.setItem("fileSort", "grid");
      break;
    case "list":
      fileList.removeClass("grid");
      localStorage.setItem("fileSort", "list");
      break;
  }
}

function setTheme(theme) {
  if (theme === "light") {
    document.body.classList.add("light");
    localStorage.setItem("theme", "light");
    themeButton.html(sun);
  } else if (theme === "system") {
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: light)").matches
    ) {
      document.body.classList.add("light");
      localStorage.setItem("theme", "system");
      themeButton.html(computerGeneric);
    } else {
      document.body.classList.remove("light");
      localStorage.setItem("theme", "system");
      themeButton.html(computerGeneric);
    }
  } else {
    document.body.classList.remove("light");
    localStorage.setItem("theme", "dark");
    themeButton.html(moon);
  }
}

function Search(startingPath, searchTerm) {
  const fuse = new Fuse(startingPath.children, fuseOptions);
  const searchResults = fuse.search(searchTerm);
  return searchResults;
}

function AddEventListeners() {
  ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
    dropArea.addEventListener(eventName, preventDefaults, false);
  });

  ["dragenter", "dragover"].forEach((eventName) => {
    dropArea.addEventListener(eventName, highlight, false);
  });

  ["dragleave", "drop"].forEach((eventName) => {
    dropArea.addEventListener(eventName, unhighlight, false);
  });

  dropArea.addEventListener("drop", handleDrop, false);

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  function highlight(e) {
    dropArea.classList.add("highlight");
  }

  function unhighlight(e) {
    dropArea.classList.remove("highlight");
  }

  function handleDrop(e) {
    const files = e.dataTransfer.files;
    uploadFiles(files);
    unhighlight(e);
  }

  function uploadFiles(files) {
    fileUploadInput[0].files = files;
    UploadFile();
  }

  dropArea.addEventListener("click", function () {
    fileUploadInput.click();
  });

  fileUploadButton.click(function () {
    uploadFiles(fileUploadInput[0].files);
  });

  fileUploadInput.change(function () {
    preview.innerHTML = "";
    const files = fileUploadInput[0].files;
    const imagesContainer = document.createElement("div");
    imagesContainer.classList.add("images-container");

    if (files.length <= 0) {
      preview.style.display = "none";
      dropArea.classList.remove("file-selected");
    } else {
      preview.style.display = "flex";
      dropArea.classList.add("file-selected");
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileType = file.type.split("/")[0];

      if (fileType === "image") {
        const img = document.createElement("img");
        img.src = URL.createObjectURL(file);
        img.style.width = "50px";
        img.style.height = "50px";
        img.style.objectFit = "cover";
        img.style.margin = "10px";
        imagesContainer.appendChild(img);
      } else {
        const div = document.createElement("div");
        div.textContent = file.name;
        div.style.margin = "10px";
        preview.appendChild(div);
      }
    }

    preview.appendChild(imagesContainer);
  });

  gridButton.click(function () {
    SortFiles("grid");
  });

  listButton.click(function () {
    SortFiles("list");
  });

  themeButton.click(function () {
    const currentTheme = localStorage.getItem("theme");
    if (currentTheme === "light") {
      setTheme("dark");
    } else if (currentTheme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  });

  searchIcon.click(function () {
    searchInput.toggleClass("active");
    searchInput.focus();
  });

  searchInput.keyup(function () {
    const searchTerm = searchInput.val();
    const searchResults = Search(RequestUserDirectory(), searchTerm);
    if (searchResults.length > 0) {
    } else {
      ListFileElements(RequestUserDirectory(), "");
    }
  });

  updateProgressBar(0);
}

if (CheckLoggedIn()) {
  console.log("Welcome, " + RequestUserData("username"));
  document.getElementById("login-form").style.display = "none";
  document.getElementById("dashboard").style.display = "flex";
  document.getElementById("logout").addEventListener("click", LogoutUser);
  const usernameElements = document.getElementsByClassName("username");
  for (let i = 0; i < usernameElements.length; i++) {
    usernameElements[i].textContent = RequestUserData("username");
  }

  ReturnUserDirectory();
  const userDirectory = RequestUserDirectory();
  ListFileElements(userDirectory, "");
  AddEventListeners();
  if (localStorage.getItem("fileSort") === "grid") {
    SortFiles("grid");
  } else {
    localStorage.setItem("fileSort", "list");
    SortFiles("list");
  }

  if (localStorage.getItem("theme") === "light") {
    setTheme("light");
  } else if (localStorage.getItem("theme") === "system") {
    setTheme("system");
  } else {
    setTheme("dark");
  }
} else {
  document.getElementById("login-form").style.display = "flex";
  document.getElementById("dashboard").style.display = "none";
  document.getElementById("logout").style.display = "none";
}
