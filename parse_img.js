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

        let counter = 1; // Счётчик для добавления порядковых номеров к одинаковым именам файлов
        
        for (let url of uniqueUrls) {
            let filename = `image_${counter}.jpg`; // Уникальное имя файла
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
                    console.error(error);
                    retryCount++;
                    await new Promise(resolve => setTimeout(resolve, retryDelay));
                }
            }
            
            if (!downloaded) {
                console.error(`Не удалось скачать изображение ${filename} после ${maxRetries} попыток.`);
            }

            counter++; // Увеличиваем счётчик для следующего уникального имени файла
        }
    } catch (error) {
        console.error('Ошибка при загрузке файла JSON:', error);
    }
}

downloadImagesFromJSON();