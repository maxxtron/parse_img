async function downloadImagesFromJSON() {
    const maxRetries = 3; // Максимальное количество попыток скачивания
    const retryDelay = 5000; // Задержка между попытками скачивания (в миллисекундах)
    const downloadDelay = 1000; // Задержка между последовательными загрузками (в миллисекундах)
    const jsonURL = '/urls.json';
    let status = document.querySelector('.preloader'),
        btn = document.querySelector('#btn'),
        icon = document.querySelector('img'),
        info = document.querySelector('.info'),
        ok = document.querySelector('.ok');
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
        status.classList.remove('hide');
        icon.classList.add('hide');
        btn.innerHTML = "Downloading...";
        btn.disabled = true;
         btn.style.backgroundColor = 'grey';
         btn.style.opacity = 0.8;
         btn.style.cursor = 'default';
         info.classList.remove('hide');

        for (let i = 0; i < data.length; i++) {
            // let url = data[i];
            let url = `https://www.munters.com/${data[i]}`;
            info.innerHTML = `Downloading ${i + 1} of ${data.length} files...`;
            let parts = url.split("/");
            let lastPart = parts.pop();
            let beforeLastPart = parts.pop();
            let result = beforeLastPart + "/" + lastPart.replaceAll("%", "_");
            let retryCount = 0;
            let downloaded = false;
            
            while (!downloaded && retryCount < maxRetries) {
                try {
                    const response = await fetch(url);
                    if (!response.ok) {
                        throw new Error('Ошибка при загрузке изображения: ' + response.statusText);
                    }
                    const blob = await response.blob();
                    // status.className.remove("hide");
                    // Добавляем порядковый номер к имени файла, если оно уже существует
                    let filename = result;
                    if (retryCount > 0) {
                        filename = `${result}_${retryCount}`;
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
                    console.error(`Ошибка при загрузке изображения ${result}:`, error);
                    retryCount++;
                    await new Promise(resolve => setTimeout(resolve, retryDelay));
                }
            }
            
            if (!downloaded) {
                console.error(`Не удалось скачать изображение ${result} после ${maxRetries} попыток.`);
            }

            // Добавляем небольшую задержку перед следующей загрузкой
            await new Promise(resolve => setTimeout(resolve, downloadDelay));
        }
    } catch (error) {
        console.error('Ошибка при загрузке файла JSON:', error);
    }
    status.classList.add('hide');
    icon.classList.remove('hide');
    btn.innerHTML = 'Completed';
    info.classList.add('hide');
    ok.classList.remove('hide');
}
document.addEventListener("DOMContentLoaded", function() { // Получаем кнопку
    if (btn) {
        btn.addEventListener("click", function() {
            downloadImagesFromJSON();
        });
    } else {
        console.error('Кнопка не найдена.');
    }
});

