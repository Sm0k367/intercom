/**
 * EpicTech.AI Knowledge Base - Interactive JavaScript
 * Comprehensive Intercom integration with search and FAQ functionality
 */

// Knowledge Base Application Class
class KnowledgeBaseApp {
    constructor() {
        this.init();
        this.bindEvents();
        this.setupIntercomIntegration();
    }

    init() {
        console.log('📚 EpicTech.AI Knowledge Base Initialized');
        this.searchInput = document.getElementById('knowledge-search');
        this.faqItems = document.querySelectorAll('.faq-item');
        this.categoryCards = document.querySelectorAll('.category-card');
        
        // Initialize FAQ functionality
        this.setupFAQ();
        
        // Initialize search functionality
        this.setupSearch();
        
        // Initialize category interactions
        this.setupCategories();
    }

    bindEvents() {
        // Search functionality
        if (this.searchInput) {
            this.searchInput.addEventListener('input', this.debounce((e) => {
                this.handleSearch(e.target.value);
            }, 300));
            
            this.searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.handleSearch(e.target.value);
                }
            });
        }

        // Search button
        const searchButton = document.querySelector('.search-button');
        if (searchButton) {
            searchButton.addEventListener('click', () => {
                if (this.searchInput) {
                    this.handleSearch(this.searchInput.value);
                }
            });
        }

        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            // Escape key to close any open FAQ items
            if (e.key === 'Escape') {
                this.closeAllFAQ();
            }
            
            // Ctrl/Cmd + K to focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                if (this.searchInput) {
                    this.searchInput.focus();
                }
            }
        });
    }

    setupFAQ() {
        this.faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');
            const toggle = item.querySelector('.faq-toggle');

            if (question && answer && toggle) {
                question.addEventListener('click', () => {
                    const isActive = item.classList.contains('active');
                    
                    // Close all other FAQ items
                    this.faqItems.forEach(otherItem => {
                        if (otherItem !== item) {
                            otherItem.classList.remove('active');
                            const otherAnswer = otherItem.querySelector('.faq-answer');
                            if (otherAnswer) {
                                otherAnswer.style.maxHeight = '0';
                            }
                        }
                    });

                    // Toggle current item
                    if (isActive) {
                        item.classList.remove('active');
                        answer.style.maxHeight = '0';
                    } else {
                        item.classList.add('active');
                        answer.style.maxHeight = answer.scrollHeight + 'px';
                    }

                    // Update ARIA attributes
                    question.setAttribute('aria-expanded', !isActive);
                });

                // Make FAQ items keyboard accessible
                question.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        question.click();
                    }
                });
            }
        });
    }

    setupSearch() {
        // Create search results container
        this.createSearchResults();
        
        // Initialize search index
        this.buildSearchIndex();
    }

    createSearchResults() {
        const searchContainer = document.querySelector('.search-container');
        if (searchContainer) {
            const resultsContainer = document.createElement('div');
            resultsContainer.className = 'search-results';
            resultsContainer.style.cssText = `
                display: none;
                background: white;
                border: 1px solid var(--border-color);
                border-radius: var(--radius-lg);
                box-shadow: var(--shadow-lg);
                margin-top: 1rem;
                max-height: 400px;
                overflow-y: auto;
            `;
            searchContainer.appendChild(resultsContainer);
            this.searchResults = resultsContainer;
        }
    }

    buildSearchIndex() {
        this.searchIndex = [];
        
        // Index FAQ items
        this.faqItems.forEach((item, index) => {
            const question = item.querySelector('.faq-question span:first-child');
            const answer = item.querySelector('.faq-answer');
            
            if (question && answer) {
                this.searchIndex.push({
                    type: 'faq',
                    title: question.textContent,
                    content: answer.textContent,
                    element: item,
                    section: 'FAQ'
                });
            }
        });

        // Index category cards
        this.categoryCards.forEach(card => {
            const title = card.querySelector('h3');
            const description = card.querySelector('p');
            
            if (title && description) {
                this.searchIndex.push({
                    type: 'category',
                    title: title.textContent,
                    content: description.textContent,
                    element: card,
                    section: 'Categories'
                });
            }
        });

        // Index documentation sections
        document.querySelectorAll('.doc-card').forEach(card => {
            const title = card.querySelector('h4');
            const description = card.querySelector('p');
            
            if (title && description) {
                this.searchIndex.push({
                    type: 'documentation',
                    title: title.textContent,
                    content: description.textContent,
                    element: card,
                    section: 'Documentation'
                });
            }
        });
    }

    handleSearch(query) {
        if (!query || query.length < 2) {
            this.hideSearchResults();
            return;
        }

        const results = this.searchContent(query);
        this.displaySearchResults(results, query);
    }

    searchContent(query) {
        const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 1);
        
        return this.searchIndex.filter(item => {
            const searchText = (item.title + ' ' + item.content).toLowerCase();
            return searchTerms.some(term => searchText.includes(term));
        }).sort((a, b) => {
            // Prioritize title matches
            const aTitle = a.title.toLowerCase().includes(query.toLowerCase());
            const bTitle = b.title.toLowerCase().includes(query.toLowerCase());
            
            if (aTitle && !bTitle) return -1;
            if (!aTitle && bTitle) return 1;
            return 0;
        }).slice(0, 8); // Limit to 8 results
    }

    displaySearchResults(results, query) {
        if (!this.searchResults) return;

        if (results.length === 0) {
            this.searchResults.innerHTML = `
                <div style="padding: 1rem; text-align: center; color: var(--text-secondary);">
                    <p>No results found for "${query}"</p>
                    <p style="font-size: 0.875rem; margin-top: 0.5rem;">
                        Try using different keywords or 
                        <a href="#" onclick="Intercom('show')" style="color: var(--primary-color);">ask our support team</a>
                    </p>
                </div>
            `;
        } else {
            this.searchResults.innerHTML = results.map(result => `
                <div class="search-result-item" style="
                    padding: 1rem;
                    border-bottom: 1px solid var(--border-color);
                    cursor: pointer;
                    transition: background var(--transition-fast);
                " onclick="knowledgeBase.goToResult('${result.type}', ${this.searchIndex.indexOf(result)})">
                    <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 0.25rem;">
                        ${this.highlightText(result.title, query)}
                    </div>
                    <div style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.25rem;">
                        ${result.section}
                    </div>
                    <div style="font-size: 0.875rem; color: var(--text-secondary);">
                        ${this.highlightText(this.truncateText(result.content, 100), query)}
                    </div>
                </div>
            `).join('');
        }

        this.searchResults.style.display = 'block';
    }

    highlightText(text, query) {
        if (!query) return text;
        
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark style="background: #ffd700; padding: 0 0.25rem;">$1</mark>');
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
    }

    goToResult(type, index) {
        const result = this.searchIndex[index];
        if (!result) return;

        this.hideSearchResults();

        if (type === 'faq') {
            // Scroll to FAQ section and open the specific item
            const faqSection = document.getElementById('faq');
            if (faqSection) {
                faqSection.scrollIntoView({ behavior: 'smooth' });
                
                setTimeout(() => {
                    // Close all FAQ items first
                    this.closeAllFAQ();
                    
                    // Open the specific FAQ item
                    const faqItem = result.element;
                    const answer = faqItem.querySelector('.faq-answer');
                    const question = faqItem.querySelector('.faq-question');
                    
                    faqItem.classList.add('active');
                    if (answer) {
                        answer.style.maxHeight = answer.scrollHeight + 'px';
                    }
                    if (question) {
                        question.setAttribute('aria-expanded', 'true');
                    }
                    
                    // Highlight the item briefly
                    faqItem.style.background = '#fff3cd';
                    setTimeout(() => {
                        faqItem.style.background = '';
                    }, 2000);
                }, 1000);
            }
        } else if (type === 'category') {
            // Scroll to categories section and highlight the card
            const categoriesSection = document.getElementById('categories');
            if (categoriesSection) {
                categoriesSection.scrollIntoView({ behavior: 'smooth' });
                
                setTimeout(() => {
                    const card = result.element;
                    card.style.background = '#e3f2fd';
                    card.style.transform = 'scale(1.02)';
                    
                    setTimeout(() => {
                        card.style.background = '';
                        card.style.transform = '';
                    }, 2000);
                }, 1000);
            }
        }
    }

    hideSearchResults() {
        if (this.searchResults) {
            this.searchResults.style.display = 'none';
        }
    }

    closeAllFAQ() {
        this.faqItems.forEach(item => {
            item.classList.remove('active');
            const answer = item.querySelector('.faq-answer');
            const question = item.querySelector('.faq-question');
            
            if (answer) {
                answer.style.maxHeight = '0';
            }
            if (question) {
                question.setAttribute('aria-expanded', 'false');
            }
        });
    }

    setupCategories() {
        this.categoryCards.forEach(card => {
            card.addEventListener('click', () => {
                // Add click animation
                card.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    card.style.transform = '';
                }, 150);
                
                // You can add navigation logic here
                // For now, we'll just show a message via Intercom
                if (window.Intercom) {
                    const categoryName = card.querySelector('h3').textContent;
                    window.Intercom('showNewMessage', `I'm interested in learning more about ${categoryName}. Can you help me get started?`);
                }
            });

            // Keyboard accessibility
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    card.click();
                }
            });
        });
    }

    setupIntercomIntegration() {
        // Enhanced Intercom configuration
        if (window.Intercom) {
            // Custom Intercom events
            window.Intercom('onShow', () => {
                console.log('Intercom chat opened');
                this.trackEvent('intercom_opened');
            });

            window.Intercom('onHide', () => {
                console.log('Intercom chat closed');
                this.trackEvent('intercom_closed');
            });

            // Auto-suggest based on current page section
            this.setupContextualHelp();
        }

        // Fallback for when Intercom isn't loaded
        setTimeout(() => {
            if (!window.Intercom) {
                console.warn('Intercom not loaded, providing fallback support options');
                this.setupFallbackSupport();
            }
        }, 5000);
    }

    setupContextualHelp() {
        // Detect which section user is viewing and provide contextual help
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.id;
                    this.updateIntercomContext(sectionId);
                }
            });
        }, { threshold: 0.5 });

        // Observe main sections
        ['categories', 'faq', 'documentation', 'contact'].forEach(id => {
            const section = document.getElementById(id);
            if (section) {
                observer.observe(section);
            }
        });
    }

    updateIntercomContext(sectionId) {
        if (!window.Intercom) return;

        const contextMessages = {
            'categories': 'I see you\'re browsing our knowledge base categories. What specific topic are you looking for help with?',
            'faq': 'You\'re viewing our FAQ section. Do you have a specific question I can help answer?',
            'documentation': 'I notice you\'re in our documentation section. Are you looking for API information or integration help?',
            'contact': 'I see you\'re looking at contact options. How can I assist you today?'
        };

        // Update Intercom with contextual information
        window.Intercom('update', {
            current_section: sectionId,
            suggested_message: contextMessages[sectionId] || 'How can I help you today?'
        });
    }

    setupFallbackSupport() {
        // Create a fallback support button if Intercom fails to load
        const fallbackButton = document.createElement('div');
        fallbackButton.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--primary-color);
            color: white;
            padding: 1rem;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: var(--shadow-lg);
            z-index: 1000;
            font-size: 1.5rem;
        `;
        fallbackButton.innerHTML = '💬';
        fallbackButton.title = 'Contact Support';
        
        fallbackButton.addEventListener('click', () => {
            window.open('mailto:epictechai@gmail.com?subject=Support Request from Knowledge Base', '_blank');
        });
        
        document.body.appendChild(fallbackButton);
    }

    trackEvent(eventName, properties = {}) {
        // Simple event tracking
        console.log(`Event: ${eventName}`, properties);
        
        // You can integrate with analytics services here
        if (window.gtag) {
            window.gtag('event', eventName, properties);
        }
    }

    // Utility function for debouncing
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.knowledgeBase = new KnowledgeBaseApp();
    
    // Add some helpful keyboard shortcuts info
    console.log(`
🚀 EpicTech.AI Knowledge Base Shortcuts:
• Ctrl/Cmd + K: Focus search
• Escape: Close FAQ items
• Tab: Navigate through elements
• Enter/Space: Activate buttons and links
    `);
});

// Handle Intercom loading
window.addEventListener('load', () => {
    // Check if Intercom loaded successfully
    if (window.Intercom) {
        console.log('✅ Intercom loaded successfully');
        
        // Add custom styling to Intercom launcher
        const style = document.createElement('style');
        style.textContent = `
            .intercom-launcher {
                background: var(--primary-color) !important;
            }
            .intercom-launcher:hover {
                background: var(--primary-dark) !important;
            }
        `;
        document.head.appendChild(style);
    } else {
        console.warn('⚠️ Intercom failed to load');
    }
});

// Export for testing purposes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { KnowledgeBaseApp };
}
