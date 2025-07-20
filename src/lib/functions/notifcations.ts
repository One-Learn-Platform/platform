export async function checkPermission() {
	const permission = await Notification.requestPermission();
	if (permission === "granted") {
		return true;
	} else {
		return false;
	}
}

export async function sendNotification(title: string, body: string) {
	if (await checkPermission()) {
		new Notification(title, {
			body,
		});
	} else {
		console.warn("Notification permission denied");
	}
}
