async function downloadImagesFromJSON() {
    const maxRetries = 3; // Максимальное количество попыток скачивания
    const retryDelay = 5000; // Задержка между попытками скачивания (в миллисекундах)
    const jsonURL = '/urls.json'; // URL вашего JSON файла на сервере Vercel

    try {
        const response = await fetch(jsonURL);
        if (!response.ok) {
            throw new Error('Ошибка при загрузке файла JSON: ' + response.statusText);
        }
        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error('Ошибка при загрузке файла JSON: данные не являются массивом.');
        }

        console.log('Список URL-адресов для загрузки:');
        console.log(data);

        await Promise.all(data.map(async (url) => {
            let lastPart = url.split("/").pop().replaceAll("%", "_");
            console.log(url);
            
            let retryCount = 0;
            let downloaded = false;
            
            while (!downloaded && retryCount < maxRetries) {
                try {
                    const response = await fetch(url);
                    if (!response.ok) {
                        throw new Error('Ошибка при загрузке изображения: ' + response.statusText);
                    }
                    const blob = await response.blob();
                    
                    // Добавляем порядковый номер к имени файла, если оно уже существует
                    let filename = lastPart;
                    if (retryCount > 0) {
                        filename = `${lastPart}_${retryCount}`;
                    }
                    
                    const fileURL = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = fileURL;
                    a.download = filename;
                    a.style.display = 'none';
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(fileURL);
                    document.body.removeChild(a);
                    downloaded = true;
                } catch (error) {
                    console.error(`Ошибка при загрузке изображения ${lastPart}:`, error);
                    retryCount++;
                    await new Promise(resolve => setTimeout(resolve, retryDelay));
                }
            }
            
            if (!downloaded) {
                console.error(`Не удалось скачать изображение ${lastPart} после ${maxRetries} попыток.`);
            }
        }));
    } catch (error) {
        console.error('Ошибка при загрузке файла JSON:', error);
    }
}

downloadImagesFromJSON();
