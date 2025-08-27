class StudentsApp {
    constructor() {
        this.currentStudents = [];
        this.allStudents = [];
        this.editingStudentId = null;
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.isLoading = false;
        this.searchTimeout = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.applyTheme();
        this.loadInitialData();
    }

    async loadInitialData() {
        if (this.isLoading) return;
        this.isLoading = true;
        
        try {
            await this.loadStudents();
            await this.updateStatistics();
            this.populateFilters();
        } finally {
            this.isLoading = false;
        }
    }

    setupEventListeners() {
        const addStudentBtn = document.getElementById('addStudentBtn');
        const closeModal = document.getElementById('closeModal');
        const cancelBtn = document.getElementById('cancelBtn');
        const studentForm = document.getElementById('studentForm');
        const searchInput = document.getElementById('searchInput');
        const lightModeBtn = document.getElementById('lightModeBtn');
        const darkModeBtn = document.getElementById('darkModeBtn');
        const filterCarrera = document.getElementById('filterCarrera');
        const filterCiclo = document.getElementById('filterCiclo');
        const generateReportBtn = document.getElementById('generateReportBtn');

        if (addStudentBtn) {
            addStudentBtn.addEventListener('click', () => this.openModal());
        }

        if (closeModal) {
            closeModal.addEventListener('click', () => this.closeModal());
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeModal());
        }

        if (studentForm) {
            studentForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    this.handleSearch(e.target.value);
                }, 300);
            });
        }

        if (lightModeBtn) {
            lightModeBtn.addEventListener('click', () => this.setTheme('light'));
        }

        if (darkModeBtn) {
            darkModeBtn.addEventListener('click', () => this.setTheme('dark'));
        }

        if (filterCarrera) {
            filterCarrera.addEventListener('change', () => this.applyFilters());
        }

        if (filterCiclo) {
            filterCiclo.addEventListener('change', () => this.applyFilters());
        }

        if (generateReportBtn) {
            generateReportBtn.addEventListener('click', () => this.generatePDFReport());
        }

        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const section = item.getAttribute('data-section');
                this.showSection(section);
            });
        });

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal') && e.target.id === 'studentModal') {
                this.closeModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    setTheme(theme) {
        this.currentTheme = theme;
        localStorage.setItem('theme', theme);
        this.applyTheme();
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        
        const lightBtn = document.getElementById('lightModeBtn');
        const darkBtn = document.getElementById('darkModeBtn');
        
        if (lightBtn && darkBtn) {
            lightBtn.classList.toggle('active', this.currentTheme === 'light');
            darkBtn.classList.toggle('active', this.currentTheme === 'dark');
        }
    }

    showSection(sectionName) {
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        const targetSection = document.getElementById(`${sectionName}-section`);
        const targetNavItem = document.querySelector(`[data-section="${sectionName}"]`);

        if (targetSection) {
            targetSection.classList.add('active');
        }

        if (targetNavItem) {
            targetNavItem.classList.add('active');
        }

        if (sectionName === 'students') {
            this.renderStudentsTable();
        } else if (sectionName === 'reports') {
            this.loadReports();
        }
    }

    async loadStudents() {
        if (this.isLoading && this.allStudents.length > 0) return;
        
        this.showLoading(true);
        
        try {
            const response = await fetch('/api/search/');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success && Array.isArray(data.data)) {
                this.allStudents = data.data;
                this.currentStudents = [...this.allStudents];
                this.renderStudentsTable();
                return true;
            } else {
                this.allStudents = [];
                this.currentStudents = [];
                this.showToast('No se encontraron estudiantes', 'info');
                return false;
            }
        } catch (error) {
            console.error('Error loading students:', error);
            this.showToast('Error al cargar estudiantes', 'error');
            this.allStudents = [];
            this.currentStudents = [];
            return false;
        } finally {
            this.showLoading(false);
        }
    }

    renderStudentsTable() {
        const tbody = document.getElementById('studentsTableBody');
        if (!tbody) return;

        if (this.currentStudents.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">
                        No se encontraron estudiantes
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.currentStudents.map(student => `
            <tr class="fade-in">
                <td>
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <div class="student-avatar" style="width: 40px; height: 40px; font-size: 0.875rem;">
                            ${this.getInitials(student)}
                        </div>
                        <div>
                            <div class="student-name" style="font-weight: 600;">
                                ${this.getFullName(student)}
                            </div>
                            <div style="font-size: 0.8rem; color: var(--text-muted);">
                                ${student.telefono || 'Sin teléfono'}
                            </div>
                        </div>
                    </div>
                </td>
                <td>${student.carrera || 'Sin carrera'}</td>
                <td>${student.ciclo || '0'}° Ciclo</td>
                <td>${student.correo || 'Sin correo'}</td>
                <td>
                    <span class="status-badge ${student.estado_estudiante || 'activo'}">
                        ${this.getStatusText(student.estado_estudiante)}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action btn-edit" onclick="app.editStudent('${student.id}')" title="Editar">
                            ✏️
                        </button>
                        <button class="btn-action btn-delete" onclick="app.deleteStudent('${student.id}')" title="Eliminar">
                            🗑️
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    getInitials(student) {
        const nombre = student.nombre || '';
        const apellido = student.apellido_paterno || '';
        return (nombre.charAt(0) + apellido.charAt(0)).toUpperCase();
    }

    getFullName(student) {
        const parts = [
            student.nombre,
            student.apellido_paterno,
            student.apellido_materno
        ].filter(part => part && part.trim());
        
        return parts.length > 0 ? parts.join(' ') : 'Sin nombre';
    }

    getStatusText(status) {
        const statusMap = {
            'activo': 'Activo',
            'inactivo': 'Inactivo',
            'graduado': 'Graduado',
            'retirado': 'Retirado'
        };
        return statusMap[status] || 'Activo';
    }

    handleSearch(query) {
        if (!query || query.trim() === '') {
            this.currentStudents = [...this.allStudents];
        } else {
            const searchTerm = query.toLowerCase().trim();
            this.currentStudents = this.allStudents.filter(student => {
                const fullName = this.getFullName(student).toLowerCase();
                const carrera = (student.carrera || '').toLowerCase();
                const correo = (student.correo || '').toLowerCase();
                const telefono = (student.telefono || '').toLowerCase();
                
                return fullName.includes(searchTerm) || 
                       carrera.includes(searchTerm) || 
                       correo.includes(searchTerm) ||
                       telefono.includes(searchTerm);
            });
        }
        
        this.renderStudentsTable();
    }

    applyFilters() {
        const carreraFilter = document.getElementById('filterCarrera')?.value;
        const cicloFilter = document.getElementById('filterCiclo')?.value;
        
        let filteredStudents = [...this.allStudents];
        
        if (carreraFilter) {
            filteredStudents = filteredStudents.filter(student => 
                student.carrera === carreraFilter
            );
        }
        
        if (cicloFilter) {
            filteredStudents = filteredStudents.filter(student => 
                student.ciclo && student.ciclo.toString() === cicloFilter
            );
        }
        
        this.currentStudents = filteredStudents;
        this.renderStudentsTable();
    }

    populateFilters() {
        const carreraFilter = document.getElementById('filterCarrera');
        if (!carreraFilter || this.allStudents.length === 0) return;

        const carreras = [...new Set(this.allStudents.map(s => s.carrera).filter(c => c))];
        
        carreraFilter.innerHTML = '<option value="">Todas las carreras</option>';
        carreras.forEach(carrera => {
            const option = document.createElement('option');
            option.value = carrera;
            option.textContent = carrera;
            carreraFilter.appendChild(option);
        });
    }

    async updateStatistics() {
        if (this.allStudents.length === 0) {
            this.setStatisticsToZero();
            return;
        }

        const stats = this.calculateStatistics();
        
        this.updateStatElement('totalStudents', stats.total);
        this.updateStatElement('activeStudents', stats.active);
        this.updateStatElement('averageGrade', stats.averageGrade);
        this.updateStatElement('totalCareers', stats.careers);
    }

    calculateStatistics() {
        const total = this.allStudents.length;
        const active = this.allStudents.filter(s => s.estado_estudiante === 'activo').length;
        const careers = new Set(this.allStudents.map(s => s.carrera).filter(c => c)).size;
        
        const grades = this.allStudents
            .map(s => parseFloat(s.promedio_general))
            .filter(g => !isNaN(g) && g > 0);
        
        const averageGrade = grades.length > 0 
            ? (grades.reduce((a, b) => a + b, 0) / grades.length).toFixed(1)
            : '0.0';

        return { total, active, averageGrade, careers };
    }

    setStatisticsToZero() {
        this.updateStatElement('totalStudents', 0);
        this.updateStatElement('activeStudents', 0);
        this.updateStatElement('averageGrade', '0.0');
        this.updateStatElement('totalCareers', 0);
    }

    updateStatElement(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
    }

    loadReports() {
        this.generateCharts();
    }

    generateCharts() {
        this.generateCareerChart();
        this.generateCampusChart();
        this.generatePerformanceChart();
        this.generateTrendChart();
    }

    generateCareerChart() {
        const careerChart = document.getElementById('careerChart');
        if (!careerChart || this.allStudents.length === 0) return;

        const careerCounts = {};
        this.allStudents.forEach(student => {
            const carrera = student.carrera || 'Sin carrera';
            careerCounts[carrera] = (careerCounts[carrera] || 0) + 1;
        });

        const colors = ['#2563eb', '#f59e0b', '#059669', '#dc2626', '#8b5cf6'];
        const chartData = Object.entries(careerCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);

        const total = Object.values(careerCounts).reduce((a, b) => a + b, 0);
        let currentAngle = 0;

        const pieSlices = chartData.map(([carrera, count], index) => {
            const percentage = (count / total) * 100;
            const angle = (count / total) * 360;
            const x1 = 50 + 45 * Math.cos((currentAngle - 90) * Math.PI / 180);
            const y1 = 50 + 45 * Math.sin((currentAngle - 90) * Math.PI / 180);
            const x2 = 50 + 45 * Math.cos((currentAngle + angle - 90) * Math.PI / 180);
            const y2 = 50 + 45 * Math.sin((currentAngle + angle - 90) * Math.PI / 180);
            const largeArc = angle > 180 ? 1 : 0;

            const pathData = `M 50,50 L ${x1},${y1} A 45,45 0 ${largeArc},1 ${x2},${y2} Z`;
            currentAngle += angle;

            return `
                <path d="${pathData}" fill="${colors[index % colors.length]}" opacity="0.8" />
            `;
        });

        const legend = chartData.map(([carrera, count], index) => `
            <div style="display: flex; align-items: center; margin-bottom: 0.5rem;">
                <div style="width: 12px; height: 12px; background: ${colors[index % colors.length]}; margin-right: 0.5rem; border-radius: 2px;"></div>
                <span style="font-size: 0.8rem;">${carrera}: ${count}</span>
            </div>
        `).join('');

        careerChart.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <svg width="120" height="120" viewBox="0 0 100 100">
                    ${pieSlices.join('')}
                </svg>
                <div style="flex: 1; margin-left: 1rem;">
                    ${legend}
                </div>
            </div>
        `;
    }

    generateCampusChart() {
        const campusChart = document.getElementById('campusChart');
        if (!campusChart || this.allStudents.length === 0) return;

        const sedeCounts = {};
        this.allStudents.forEach(student => {
            const sede = student.sede || 'Sin sede';
            sedeCounts[sede] = (sedeCounts[sede] || 0) + 1;
        });

        const maxCount = Math.max(...Object.values(sedeCounts));
        const colors = ['#2563eb', '#f59e0b', '#059669', '#dc2626', '#8b5cf6'];

        const bars = Object.entries(sedeCounts).map(([sede, count], index) => {
            const height = (count / maxCount) * 80;
            return `
                <div style="display: flex; flex-direction: column; align-items: center; margin: 0 0.5rem;">
                    <div style="
                        width: 30px; 
                        height: ${height}px; 
                        background: ${colors[index % colors.length]}; 
                        margin-bottom: 0.5rem;
                        border-radius: 4px 4px 0 0;
                        display: flex;
                        align-items: end;
                        justify-content: center;
                        color: white;
                        font-size: 0.7rem;
                        padding-bottom: 0.2rem;
                    ">
                        ${count}
                    </div>
                    <div style="font-size: 0.7rem; text-align: center; max-width: 60px; word-wrap: break-word;">
                        ${sede}
                    </div>
                </div>
            `;
        });

        campusChart.innerHTML = `
            <div style="display: flex; align-items: end; justify-content: center; height: 100px; padding: 1rem;">
                ${bars.join('')}
            </div>
        `;
    }

    generatePerformanceChart() {
        const performanceChart = document.getElementById('performanceChart');
        if (!performanceChart || this.allStudents.length === 0) return;

        const grades = this.allStudents
            .map(s => parseFloat(s.promedio_general))
            .filter(g => !isNaN(g) && g > 0);

        if (grades.length === 0) {
            performanceChart.innerHTML = `
                <div style="text-align: center; color: var(--text-muted); padding: 2rem;">
                    No hay datos de rendimiento disponibles
                </div>
            `;
            return;
        }

        const ranges = {
            'Excelente (18-20)': grades.filter(g => g >= 18).length,
            'Bueno (15-17)': grades.filter(g => g >= 15 && g < 18).length,
            'Regular (12-14)': grades.filter(g => g >= 12 && g < 15).length,
            'Deficiente (<12)': grades.filter(g => g < 12).length
        };

        const average = (grades.reduce((a, b) => a + b, 0) / grades.length).toFixed(1);

        const bars = Object.entries(ranges).map(([range, count], index) => {
            const colors = ['#059669', '#f59e0b', '#2563eb', '#dc2626'];
            return `
                <div style="display: flex; align-items: center; margin-bottom: 0.5rem;">
                    <div style="width: 100px; font-size: 0.8rem;">${range}</div>
                    <div style="
                        width: ${(count / Math.max(...Object.values(ranges))) * 100}px; 
                        height: 20px; 
                        background: ${colors[index]}; 
                        margin: 0 0.5rem;
                        border-radius: 4px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-size: 0.7rem;
                        min-width: 20px;
                    ">
                        ${count}
                    </div>
                </div>
            `;
        });

        performanceChart.innerHTML = `
            <div style="padding: 1rem;">
                <div style="text-align: center; margin-bottom: 1rem; font-weight: 600;">
                    Promedio General: ${average}
                </div>
                ${bars.join('')}
            </div>
        `;
    }

    generateTrendChart() {
        const trendChart = document.getElementById('trendChart');
        if (!trendChart || this.allStudents.length === 0) return;

        const monthCounts = {};
        const currentYear = new Date().getFullYear();
        
        for (let i = 0; i < 6; i++) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthKey = date.toLocaleString('es-PE', { month: 'short' });
            monthCounts[monthKey] = Math.floor(Math.random() * 20) + 5;
        }

        const months = Object.keys(monthCounts).reverse();
        const maxCount = Math.max(...Object.values(monthCounts));

        const points = months.map((month, index) => {
            const x = (index / (months.length - 1)) * 80 + 10;
            const y = 80 - (monthCounts[month] / maxCount) * 60;
            return `${x},${y}`;
        });

        const pathData = `M ${points.join(' L ')}`;

        trendChart.innerHTML = `
            <div style="padding: 1rem;">
                <svg width="200" height="100" viewBox="0 0 100 100" style="width: 100%;">
                    <polyline 
                        points="${points.join(' ')}" 
                        fill="none" 
                        stroke="#2563eb" 
                        stroke-width="2"
                    />
                    ${months.map((month, index) => {
                        const x = (index / (months.length - 1)) * 80 + 10;
                        const y = 80 - (monthCounts[month] / maxCount) * 60;
                        return `
                            <circle cx="${x}" cy="${y}" r="2" fill="#2563eb" />
                            <text x="${x}" y="95" text-anchor="middle" font-size="6" fill="var(--text-muted)">
                                ${month}
                            </text>
                        `;
                    }).join('')}
                </svg>
            </div>
        `;
    }

    async generatePDFReport() {
        this.showToast('Generando reporte PDF...', 'info');
        
        try {
            await this.createPDFContent();
            this.showToast('Reporte PDF generado exitosamente', 'success');
        } catch (error) {
            console.error('Error generating PDF:', error);
            this.showToast('Error al generar el reporte PDF', 'error');
        }
    }

    async createPDFContent() {
        const reportData = this.prepareReportData();
        const pdfContent = this.generatePDFHTML(reportData);
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(pdfContent);
        printWindow.document.close();
        
        setTimeout(() => {
            printWindow.print();
        }, 500);
    }

    prepareReportData() {
        const stats = this.calculateStatistics();
        const careerCounts = {};
        const sedeCounts = {};
        
        this.allStudents.forEach(student => {
            const carrera = student.carrera || 'Sin carrera';
            const sede = student.sede || 'Sin sede';
            careerCounts[carrera] = (careerCounts[carrera] || 0) + 1;
            sedeCounts[sede] = (sedeCounts[sede] || 0) + 1;
        });

        return {
            stats,
            students: this.allStudents,
            careerCounts,
            sedeCounts,
            date: new Date().toLocaleDateString('es-PE')
        };
    }

    generatePDFHTML(data) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Reporte de Estudiantes</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .stats { display: flex; justify-content: space-around; margin: 20px 0; }
                    .stat { text-align: center; }
                    .stat-number { font-size: 24px; font-weight: bold; color: #2563eb; }
                    .stat-label { font-size: 14px; color: #666; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f5f5f5; }
                    .summary { margin: 20px 0; }
                    @media print { body { margin: 0; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Reporte de Estudiantes</h1>
                    <p>Generado el ${data.date}</p>
                </div>
                
                <div class="stats">
                    <div class="stat">
                        <div class="stat-number">${data.stats.total}</div>
                        <div class="stat-label">Total Estudiantes</div>
                    </div>
                    <div class="stat">
                        <div class="stat-number">${data.stats.active}</div>
                        <div class="stat-label">Estudiantes Activos</div>
                    </div>
                    <div class="stat">
                        <div class="stat-number">${data.stats.careers}</div>
                        <div class="stat-label">Carreras</div>
                    </div>
                    <div class="stat">
                        <div class="stat-number">${data.stats.averageGrade}</div>
                        <div class="stat-label">Promedio General</div>
                    </div>
                </div>
                
                <h2>Lista de Estudiantes</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Carrera</th>
                            <th>Ciclo</th>
                            <th>Correo</th>
                            <th>Teléfono</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.students.map(student => `
                            <tr>
                                <td>${this.getFullName(student)}</td>
                                <td>${student.carrera || 'Sin carrera'}</td>
                                <td>${student.ciclo || 0}°</td>
                                <td>${student.correo || 'Sin correo'}</td>
                                <td>${student.telefono || 'Sin teléfono'}</td>
                                <td>${this.getStatusText(student.estado_estudiante)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div class="summary">
                    <h3>Resumen por Carrera</h3>
                    ${Object.entries(data.careerCounts).map(([carrera, count]) => 
                        `<p>${carrera}: ${count} estudiantes</p>`
                    ).join('')}
                </div>
            </body>
            </html>
        `;
    }

    openModal(studentId = null) {
        const modal = document.getElementById('studentModal');
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('studentForm');
        
        if (!modal || !modalTitle || !form) return;

        this.editingStudentId = studentId;
        
        if (studentId) {
            modalTitle.textContent = 'Editar Estudiante';
            this.populateForm(studentId);
        } else {
            modalTitle.textContent = 'Agregar Estudiante';
            form.reset();
        }
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        const modal = document.getElementById('studentModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            this.editingStudentId = null;
        }
    }

    async populateForm(studentId) {
        const student = this.allStudents.find(s => s.id === studentId);
        if (!student) return;

        const form = document.getElementById('studentForm');
        if (!form) return;

        Object.keys(student).forEach(key => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input && student[key] !== null && student[key] !== undefined) {
                input.value = student[key];
            }
        });
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const submitBtn = document.getElementById('submitBtn');
        const btnText = submitBtn?.querySelector('.btn-text');
        const btnLoading = submitBtn?.querySelector('.btn-loading');
        
        if (submitBtn) {
            submitBtn.disabled = true;
            if (btnText) btnText.style.display = 'none';
            if (btnLoading) btnLoading.style.display = 'inline-block';
        }
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        try {
            let url, method;
            
            if (this.editingStudentId) {
                url = `/api/estudiantes/${this.editingStudentId}/update/`;
                method = 'PUT';
            } else {
                url = '/api/estudiantes/';
                method = 'POST';
            }
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCSRFToken(),
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                this.showToast(
                    this.editingStudentId ? 'Estudiante actualizado exitosamente' : 'Estudiante creado exitosamente',
                    'success'
                );
                this.closeModal();
                await this.refreshData();
            } else {
                throw new Error(result.message || 'Error al procesar la solicitud');
            }

        } catch (error) {
            console.error('Error in form submission:', error);
            this.showToast(error.message || 'Error al procesar la solicitud', 'error');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                if (btnText) btnText.style.display = 'inline';
                if (btnLoading) btnLoading.style.display = 'none';
            }
        }
    }

    async editStudent(studentId) {
        this.openModal(studentId);
    }

    async deleteStudent(studentId) {
        if (!confirm('¿Estás seguro de que deseas eliminar este estudiante?')) {
            return;
        }

        this.showLoading(true);
        
        try {
            const response = await fetch(`/api/estudiantes/${studentId}/delete/`, {
                method: 'DELETE',
                headers: {
                    'X-CSRFToken': this.getCSRFToken(),
                }
            });

            const result = await response.json();

            if (result.success) {
                this.showToast('Estudiante eliminado exitosamente', 'success');
                await this.refreshData();
            } else {
                throw new Error(result.message || 'Error al eliminar el estudiante');
            }

        } catch (error) {
            console.error('Error deleting student:', error);
            this.showToast('Error al eliminar el estudiante', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // SOLUCIÓN: Método unificado para refrescar datos sin conflictos
    async refreshData() {
        if (this.isLoading) return; // Prevenir múltiples llamadas simultáneas
        
        this.isLoading = true;
        
        try {
            // Recargar estudiantes desde servidor
            await this.loadStudents();
            
            // Actualizar estadísticas con datos reales
            await this.updateStatistics();
            
            // Actualizar filtros
            this.populateFilters();
            
            // Forzar actualización de todas las vistas
            this.renderStudentsTable();
            this.updateRecentStudentsPreview();
            
            // Si estamos en reportes, actualizar gráficos
            if (document.getElementById('reports-section')?.classList.contains('active')) {
                this.loadReports();
            }
            
        } finally {
            this.isLoading = false;
        }
    }

    // SOLUCIÓN: Búsqueda mejorada con debounce y manejo de errores
    async performSearch(query) {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.showLoading(true);
        
        try {
            const url = query.trim() ? `/api/search/?q=${encodeURIComponent(query.trim())}` : '/api/search/';
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success && Array.isArray(data.data)) {
                this.currentStudents = data.data;
                this.renderStudentsTable();
                
                // Si no hay query, actualizar también allStudents
                if (!query.trim()) {
                    this.allStudents = [...data.data];
                    await this.updateStatistics();
                    this.populateFilters();
                }
            } else {
                this.currentStudents = [];
                this.renderStudentsTable();
            }
            
        } catch (error) {
            console.error('Error in search:', error);
            this.showToast('Error en la búsqueda', 'error');
            this.currentStudents = [];
            this.renderStudentsTable();
        } finally {
            this.isLoading = false;
            this.showLoading(false);
        }
    }

    // SOLUCIÓN: Manejar búsqueda con debounce mejorado
    handleSearch(query) {
        clearTimeout(this.searchTimeout);
        
        if (!query || query.trim() === '') {
            // Si no hay búsqueda, mostrar todos los estudiantes
            this.currentStudents = [...this.allStudents];
            this.renderStudentsTable();
            return;
        }
        
        // Búsqueda local primero para respuesta rápida
        const searchTerm = query.toLowerCase().trim();
        const localResults = this.allStudents.filter(student => {
            const fullName = this.getFullName(student).toLowerCase();
            const carrera = (student.carrera || '').toLowerCase();
            const correo = (student.correo || '').toLowerCase();
            const telefono = (student.telefono || '').toLowerCase();
            
            return fullName.includes(searchTerm) || 
                   carrera.includes(searchTerm) || 
                   correo.includes(searchTerm) ||
                   telefono.includes(searchTerm);
        });
        
        // Mostrar resultados locales inmediatamente
        this.currentStudents = localResults;
        this.renderStudentsTable();
        
        // Luego hacer búsqueda en servidor con debounce
        this.searchTimeout = setTimeout(() => {
            this.performSearch(query);
        }, 500);
    }

    // SOLUCIÓN: Actualizar vista previa de estudiantes recientes
    updateRecentStudentsPreview() {
        const previewContainer = document.getElementById('recentStudentsPreview');
        if (!previewContainer) return;
        
        if (this.allStudents.length === 0) {
            previewContainer.innerHTML = `
                <div class="student-preview-card">
                    <div class="student-info">
                        <div class="student-name">No hay estudiantes registrados</div>
                        <div class="student-details">Comienza agregando el primer estudiante</div>
                    </div>
                </div>
            `;
            return;
        }

        const recentStudents = this.allStudents.slice(0, 5);
        
        // Usar DocumentFragment para mejor rendimiento
        const fragment = document.createDocumentFragment();
        
        recentStudents.forEach(student => {
            const div = document.createElement('div');
            div.className = 'student-preview-card fade-in';
            div.innerHTML = `
                <div class="student-avatar">${this.getInitials(student)}</div>
                <div class="student-info">
                    <div class="student-name">${this.getFullName(student)}</div>
                    <div class="student-details">${student.carrera || 'Sin carrera'} • Ciclo ${student.ciclo || 0}</div>
                </div>
                <div class="student-status ${student.estado_estudiante || 'activo'}">${this.getStatusText(student.estado_estudiante)}</div>
            `;
            fragment.appendChild(div);
        });
        
        // Limpiar y agregar nuevo contenido
        previewContainer.innerHTML = '';
        previewContainer.appendChild(fragment);
        
        // Forzar reflow para activar animaciones
        previewContainer.offsetHeight;
    }

    // Método para obtener token CSRF
    getCSRFToken() {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'csrftoken') {
                return value;
            }
        }
        
        // Fallback: buscar en meta tags
        const metaToken = document.querySelector('meta[name="csrf-token"]');
        if (metaToken) {
            return metaToken.getAttribute('content');
        }
        
        return '';
    }

    // Método para mostrar loading
    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.toggle('active', show);
        }
    }

    // Método para mostrar notificaciones
    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        const toastMessage = document.querySelector('.toast-message');
        const toastIcon = document.querySelector('.toast-icon');
        
        if (!toast || !toastMessage || !toastIcon) return;

        // Configurar mensaje
        toastMessage.textContent = message;
        
        // Configurar icono según tipo
        const icons = {
            success: '✅',
            error: '❌',
            info: 'ℹ️',
            warning: '⚠️'
        };
        
        toastIcon.textContent = icons[type] || icons.info;
        
        // Limpiar clases anteriores y agregar nueva
        toast.className = `toast ${type}`;
        
        // Mostrar toast
        toast.classList.add('show');
        
        // Ocultar después de 3 segundos
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // Método para exportar datos
    exportData() {
        if (this.allStudents.length === 0) {
            this.showToast('No hay datos para exportar', 'warning');
            return;
        }

        const csvContent = this.generateCSV(this.allStudents);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `estudiantes_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.showToast('Datos exportados exitosamente', 'success');
        } else {
            this.showToast('Export not supported in this browser', 'error');
        }
    }

    // Generar contenido CSV
    generateCSV(students) {
        const headers = [
            'Nombre', 'Apellido Paterno', 'Apellido Materno', 'Carrera', 
            'Ciclo', 'Correo', 'Teléfono', 'Edad', 'Sede', 'Turno', 'Estado'
        ];
        
        const csvRows = [headers.join(',')];
        
        students.forEach(student => {
            const row = [
                this.escapeCsvField(student.nombre || ''),
                this.escapeCsvField(student.apellido_paterno || ''),
                this.escapeCsvField(student.apellido_materno || ''),
                this.escapeCsvField(student.carrera || ''),
                student.ciclo || 0,
                this.escapeCsvField(student.correo || ''),
                this.escapeCsvField(student.telefono || ''),
                student.edad || 0,
                this.escapeCsvField(student.sede || ''),
                this.escapeCsvField(student.turno || ''),
                this.escapeCsvField(this.getStatusText(student.estado_estudiante))
            ];
            csvRows.push(row.join(','));
        });
        
        return csvRows.join('\n');
    }

    // Escapar campos CSV
    escapeCsvField(field) {
        if (typeof field === 'string' && (field.includes(',') || field.includes('"') || field.includes('\n'))) {
            return `"${field.replace(/"/g, '""')}"`;
        }
        return field;
    }
}

// Funciones globales para compatibilidad
function showSection(sectionName) {
    if (window.app) {
        window.app.showSection(sectionName);
    }
}

function refreshData() {
    if (window.app) {
        window.app.refreshData();
    }
}

function exportData() {
    if (window.app) {
        window.app.exportData();
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.app = new StudentsApp();
});

// Manejar errores globales
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    if (window.app) {
        window.app.showToast('Ha ocurrido un error inesperado', 'error');
    }
});

// Manejar errores de promesas no capturadas
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    if (window.app) {
        window.app.showToast('Error en operación asíncrona', 'error');
    }
});