/**
 * Excel Parser for TrombiFlow
 * Handles the extraction of student data from .xlsx, .xls, and .csv files.
 */
const ExcelParser = {
    /**
     * Parses an Excel or CSV file and returns an array of student objects.
     */
    parseFile: function(file) {
        return new Promise((resolve, reject) => {
            const isCsv = file.name.toLowerCase().endsWith('.csv');
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    let workbook;
                    const data = e.target.result;

                    if (isCsv) {
                        const decoder = new TextDecoder('utf-8');
                        const csvContent = typeof data === 'string' ? data : decoder.decode(data);
                        workbook = XLSX.read(csvContent, { type: 'string' });
                    } else {
                        const uintData = new Uint8Array(data);
                        workbook = XLSX.read(uintData, { type: 'array' });
                    }
                    
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
                    
                    if (jsonData.length === 0) {
                        reject(new Error("Le fichier est vide."));
                        return;
                    }

                    console.log("Données brutes détectées (ligne 1):", jsonData[0]);
                    const students = this.mapToStudents(jsonData);
                    resolve(students);
                } catch (error) {
                    console.error("Parsing error:", error);
                    reject(new Error("Erreur de lecture : " + error.message));
                }
            };

            reader.onerror = () => reject(new Error("Erreur de lecture du fichier."));
            reader.readAsArrayBuffer(file);
        });
    },

    /**
     * Maps raw JSON data to student objects with strict column separation.
     */
    mapToStudents: function(rawData) {
        return rawData.map((row, index) => {
            const firstName = this.findValue(row, ['prénom', 'prenom', 'first name', 'firstname', 'first_name'], ['nom']);
            const lastName = this.findValue(row, ['nom', 'last name', 'lastname', 'last_name', 'surname'], ['prénom', 'prenom']);
            
            let photo = this.findValue(row, ['photo', 'image', 'picture', 'url', 'lien', 'avatar', 'img']);
            if (!photo || !this.isUrl(photo)) {
                photo = this.findUrlInRow(row) || photo;
            }

            const group = this.findValue(row, ['classe', 'groupe', 'section', 'promo']);
            const email = this.findValue(row, ['email', 'e-mail', 'mail']);

            let finalFirstName = firstName;
            let finalLastName = lastName;

            if (!firstName && lastName && lastName.includes(' ')) {
                const parts = lastName.trim().split(/\s+/);
                finalFirstName = parts[0];
                finalLastName = parts.slice(1).join(' ');
            } else if (firstName && !lastName && firstName.includes(' ')) {
                const parts = firstName.trim().split(/\s+/);
                finalFirstName = parts[0];
                finalLastName = parts.slice(1).join(' ');
            } else if (firstName === lastName && firstName) {
                if (firstName.includes(' ')) {
                    const parts = firstName.trim().split(/\s+/);
                    finalFirstName = parts[0];
                    finalLastName = parts.slice(1).join(' ');
                }
            }

            return {
                id: index,
                firstName: finalFirstName || 'Inconnu',
                lastName: finalLastName || '',
                fullName: `${finalFirstName || ''} ${finalLastName || ''}`.trim() || `Élève ${index + 1}`,
                photo: photo ? String(photo).trim() : null,
                group: group || 'N/A',
                email: email || null,
                metadata: row
            };
        });
    },

    /**
     * Finds a value in an object with exclusion support.
     */
    findValue: function(obj, targetKeys, excludeKeys = []) {
        const objKeys = Object.keys(obj);
        
        for (const tk of targetKeys) {
            const foundKey = objKeys.find(k => k.trim().toLowerCase() === tk.toLowerCase());
            if (foundKey && obj[foundKey] !== "") return obj[foundKey];
        }

        for (const tk of targetKeys) {
            const foundKey = objKeys.find(k => {
                const kLower = k.trim().toLowerCase();
                if (!kLower.includes(tk.toLowerCase())) return false;
                for (const ex of excludeKeys) {
                    if (kLower.includes(ex.toLowerCase())) return false;
                }
                return true;
            });
            if (foundKey && obj[foundKey] !== "") return obj[foundKey];
        }

        return null;
    },

    findUrlInRow: function(row) {
        for (const key in row) {
            const val = String(row[key]);
            if (this.isUrl(val)) return val;
        }
        return null;
    },

    isUrl: function(str) {
        if (!str || typeof str !== 'string') return false;
        const s = str.trim().toLowerCase();
        return s.startsWith('http') || s.startsWith('www.') || /\.(jpg|jpeg|png|webp|gif|svg)/i.test(s);
    }
};
