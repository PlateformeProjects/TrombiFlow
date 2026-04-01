/**
 * UI Controller for TrombiFlow
 * Handles DOM manipulation and student rendering.
 */
const UI = {
    elements: {
        emptyState: document.getElementById('emptyState'),
        contentSection: document.getElementById('contentSection'),
        studentsGrid: document.getElementById('studentsGrid'),
        statsTitle: document.getElementById('statsTitle'),
        searchInput: document.getElementById('searchInput'),
        mobileSearchInput: document.getElementById('mobileSearchInput'),
        filterSpecialite: document.getElementById('filterSpecialite'),
        fileInput: document.getElementById('fileInput'),
        uploadBtn: document.getElementById('uploadBtn'),
        themeToggle: document.getElementById('themeToggle'),
        clearDataBtn: document.getElementById('clearDataBtn')
    },

    /**
     * Populates the specialite filter dropdown.
     */
    populateSpecialiteFilter: function(specialites) {
        const select = this.elements.filterSpecialite;
        // Keep the first "All" option
        select.innerHTML = '<option value="">Toutes les spécialités</option>';
        
        specialites.sort().forEach(spec => {
            if (!spec) return;
            const option = document.createElement('option');
            option.value = spec;
            option.textContent = spec;
            select.appendChild(option);
        });
    },

    /**
     * Shows the content section and hides the empty state.
     */
    showContent: function() {
        this.elements.emptyState.classList.add('hidden');
        this.elements.contentSection.classList.remove('hidden');
        this.elements.clearDataBtn.classList.remove('hidden');
        this.elements.searchInput.disabled = false;
    },

    /**
     * Hides the content section and shows the empty state.
     */
    hideContent: function() {
        this.elements.emptyState.classList.remove('hidden');
        this.elements.contentSection.classList.add('hidden');
        this.elements.clearDataBtn.classList.add('hidden');
        this.elements.searchInput.disabled = true;
        this.elements.searchInput.value = '';
        this.elements.filterSpecialite.innerHTML = '<option value="">Toutes les spécialités</option>';
    },

    /**
     * Renders an array of students into the grid.
     */
    renderStudents: function(students) {
        this.elements.studentsGrid.innerHTML = '';
        this.elements.statsTitle.textContent = `Élèves (${students.length})`;

        if (students.length === 0) {
            this.elements.studentsGrid.innerHTML = `
                <div class="col-span-full py-12 text-center text-gray-500 dark:text-gray-400">
                    Aucun résultat trouvé pour votre recherche.
                </div>
            `;
            return;
        }

        students.forEach(student => {
            const card = this.createStudentCard(student);
            this.elements.studentsGrid.appendChild(card);
        });

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    },

    /**
     * Creates a student card element with front and back.
     */
    createStudentCard: function(student) {
        const container = document.createElement('div');
        container.className = 'student-card-container group';
        
        const inner = document.createElement('div');
        inner.className = 'student-card-inner';
        
        // --- FRONT ---
        const front = document.createElement('div');
        front.className = 'student-card-front bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700';
        
        const photoUrl = student.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.fullName)}&background=random&size=200&color=fff&bold=true`;
        
        front.innerHTML = `
            <div class="aspect-square bg-gray-100 dark:bg-gray-700 overflow-hidden relative">
                <img src="${photoUrl}" 
                     alt="${student.fullName}" 
                     class="w-full h-full object-cover"
                     onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(student.fullName)}&background=random&size=200&color=fff&bold=true'">
                <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    ${student.specialite ? `
                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200">
                        ${student.specialite}
                    </span>` : ''}
                </div>
            </div>
            <div class="p-4">
                <h3 class="font-bold text-gray-900 dark:text-white truncate">
                    ${(student.lastName || '').toUpperCase()} ${student.firstName || ''}
                </h3>
                <div class="flex items-center text-xs text-blue-600 dark:text-blue-400 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <i data-lucide="info" class="w-3.5 h-3.5 mr-1.5"></i>
                    <span>Cliquer pour les détails</span>
                </div>
            </div>
        `;

        // --- BACK ---
        const back = document.createElement('div');
        back.className = 'student-card-back bg-slate-50 dark:bg-slate-900 shadow-sm border-2 border-blue-500 p-4 overflow-y-auto flex flex-col';
        
        const detailsHtml = Object.entries(student.metadata)
            .filter(([key, val]) => val && !['photo', 'url', 'image', 'picture'].some(p => key.toLowerCase().includes(p)))
            .map(([key, val]) => `
                <div class="mb-3">
                    <span class="block text-[10px] font-bold text-blue-500 uppercase tracking-wider">${key}</span>
                    <span class="text-sm text-gray-700 dark:text-gray-200 break-words">${val}</span>
                </div>
            `).join('');

        back.innerHTML = `
            <div class="flex items-center justify-between mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                <h4 class="font-bold text-gray-900 dark:text-white text-sm">Informations</h4>
                <i data-lucide="rotate-ccw" class="w-4 h-4 text-gray-400"></i>
            </div>
            <div class="flex-1">
                ${detailsHtml}
            </div>
            <div class="mt-4 pt-2 border-t border-gray-200 dark:border-gray-700 text-center">
                 <p class="text-[10px] text-gray-400">ID: ${student.id}</p>
            </div>
        `;

        inner.appendChild(front);
        inner.appendChild(back);
        container.appendChild(inner);

        container.addEventListener('click', () => {
            container.classList.toggle('is-flipped');
        });

        return container;
    }
};
