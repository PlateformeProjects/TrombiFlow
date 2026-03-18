/**
 * Main Application Logic for TrombiFlow
 * Orchestrates the Excel parser and UI controller.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Application State
    const AppState = {
        allStudents: [],
        filteredStudents: [],
        selectedSpecialite: '',
        isLoading: false
    };

    /**
     * Handles the file upload process.
     */
    async function handleFileUpload(file) {
        if (!file) return;

        const originalBtnText = UI.elements.uploadBtn.innerHTML;
        UI.elements.uploadBtn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i><span>...</span>';
        lucide.createIcons();
        UI.elements.uploadBtn.disabled = true;
        UI.elements.uploadBtn.classList.add('opacity-80', 'cursor-not-allowed');

        try {
            const students = await ExcelParser.parseFile(file);
            AppState.allStudents = students;
            AppState.filteredStudents = students;
            AppState.selectedSpecialite = '';
            
            // Extract unique specialities
            const specialites = [...new Set(students.map(s => s.specialite).filter(Boolean))];
            UI.populateSpecialiteFilter(specialites);

            UI.showContent();
            UI.renderStudents(students);
            
            UI.elements.searchInput.value = '';
            UI.elements.mobileSearchInput.value = '';
            UI.elements.filterSpecialite.value = '';

        } catch (error) {
            console.error('Error parsing file:', error);
            alert(`Erreur : ${error.message}`);
        } finally {
            UI.elements.uploadBtn.innerHTML = originalBtnText;
            UI.elements.uploadBtn.classList.remove('opacity-80', 'cursor-not-allowed');
            lucide.createIcons();
            UI.elements.uploadBtn.disabled = false;
        }
    }

    /**
     * Filters students based on search query and selected specialite.
     */
    function handleSearch() {
        const query = (UI.elements.searchInput.value || UI.elements.mobileSearchInput.value || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const specialite = AppState.selectedSpecialite;
        
        AppState.filteredStudents = AppState.allStudents.filter(student => {
            const searchableText = `${student.firstName} ${student.lastName} ${student.fullName} ${student.group} ${student.specialite || ''}`.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const matchesQuery = !query || searchableText.includes(query);
            const matchesSpecialite = !specialite || student.specialite === specialite;
            
            return matchesQuery && matchesSpecialite;
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

    UI.elements.searchInput.addEventListener('input', () => {
        handleSearch();
    });

    UI.elements.mobileSearchInput.addEventListener('input', () => {
        handleSearch();
    });

    UI.elements.filterSpecialite.addEventListener('change', (e) => {
        AppState.selectedSpecialite = e.target.value;
        handleSearch();
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
