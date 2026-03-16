/**
 * Main Application Logic for TrombiFlow
 * Orchestrates the Excel parser and UI controller.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Application State
    const AppState = {
        allStudents: [],
        filteredStudents: [],
        isLoading: false
    };

    /**
     * Handles the file upload process.
     */
    async function handleFileUpload(file) {
        if (!file) return;

        const originalBtnText = UI.elements.uploadBtn.innerHTML;
        UI.elements.uploadBtn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 mr-2 animate-spin"></i>...';
        lucide.createIcons();
        UI.elements.uploadBtn.disabled = true;

        try {
            const students = await ExcelParser.parseFile(file);
            AppState.allStudents = students;
            AppState.filteredStudents = students;
            
            UI.showContent();
            UI.renderStudents(students);
            
            UI.elements.searchInput.value = '';
            UI.elements.mobileSearchInput.value = '';

        } catch (error) {
            console.error('Error parsing file:', error);
            alert(`Erreur : ${error.message}`);
        } finally {
            UI.elements.uploadBtn.innerHTML = originalBtnText;
            lucide.createIcons();
            UI.elements.uploadBtn.disabled = false;
        }
    }

    /**
     * Filters students based on search query.
     */
    function handleSearch(query) {
        const normalizedQuery = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        AppState.filteredStudents = AppState.allStudents.filter(student => {
            const searchableText = `${student.fullName} ${student.group}`.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return searchableText.includes(normalizedQuery);
        });

        UI.renderStudents(AppState.filteredStudents);
    }

    // --- Theme Logic ---
    function initTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }

    UI.elements.themeToggle.addEventListener('click', () => {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        lucide.createIcons();
    });

    initTheme();

    // --- Event Listeners ---

    UI.elements.uploadBtn.addEventListener('click', () => {
        UI.elements.fileInput.click();
    });

    UI.elements.fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
        }
    });

    UI.elements.searchInput.addEventListener('input', (e) => {
        handleSearch(e.target.value);
    });

    UI.elements.mobileSearchInput.addEventListener('input', (e) => {
        handleSearch(e.target.value);
    });

    document.addEventListener('dragover', (e) => e.preventDefault());
    document.addEventListener('drop', (e) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files.length > 0 && (files[0].name.toLowerCase().endsWith('.xlsx') || files[0].name.toLowerCase().endsWith('.xls') || files[0].name.toLowerCase().endsWith('.csv'))) {
            handleFileUpload(files[0]);
        }
    });

    lucide.createIcons();
});
