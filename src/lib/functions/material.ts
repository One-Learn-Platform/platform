import {
	AppWindow,
	AudioLines,
	File,
	FileText,
	Film,
	Image,
	Package,
	Presentation,
	Sheet,
} from "@lucide/svelte";

const imageExts = new Set(["jpg", "jpeg", "png", "gif", "webp"]);
const videoExts = new Set(["mp4", "avi", "mov", "mkv"]);
const audioExts = new Set(["mp3", "wav", "flac", "aac"]);
const docExts = new Set(["doc", "docx", "pdf", "txt"]);
const presentationExts = new Set(["ppt", "pptx", "key"]);
const sheetExts = new Set(["xls", "xlsx", "csv"]);
const packageExts = new Set(["zip", "rar", "tar", "gz"]);
const appExts = new Set(["exe", "app", "apk", "dmg"]);

function getFileExtension(filename: string) {
	const extension = filename.split(".").pop();
	return extension ?? "";
}

export function getFileName(url: string) {
	const filename = url.split("/");
	return filename.length > 0 ? filename[filename.length - 1] : url;
}

export function getFileCategory(filename: string) {
	const ext = getFileExtension(filename).toLowerCase();
	if (imageExts.has(ext)) return "image";
	if (videoExts.has(ext)) return "video";
	if (audioExts.has(ext)) return "audio";
	if (docExts.has(ext)) return "document";
	if (presentationExts.has(ext)) return "presentation";
	if (sheetExts.has(ext)) return "spreadsheet";
	if (packageExts.has(ext)) return "package";
	if (appExts.has(ext)) return "application";
	return "unknown";
}

export function getFileIcon(extension: string) {
	const ext = getFileExtension(extension).toLowerCase();

	if (imageExts.has(ext)) return Image;
	if (videoExts.has(ext)) return Film;
	if (audioExts.has(ext)) return AudioLines;
	if (docExts.has(ext)) return FileText;
	if (presentationExts.has(ext)) return Presentation;
	if (sheetExts.has(ext)) return Sheet;
	if (packageExts.has(ext)) return Package;
	if (appExts.has(ext)) return AppWindow;

	return File;
}
