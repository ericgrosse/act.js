// Act.js

class ActComponent {
  constructor(options) {
    this.template = options.template || '';
    this.data = options.data || {};
    this.methods = options.methods || {};
    this.el = document.querySelector(options.target) || document.body;
    this.setupReactivity();
    this.render();
  }

  setupReactivity() {
    this.state = new Proxy(this.data, {
      set: (target, key, value) => {
        target[key] = value;
        this.render();
        return true;
      },
    });
  }

  render() {
    this.el.innerHTML = this.template(this.state, this.methods);
    this.bindEvents();
  }

  bindEvents() {
    Object.keys(this.methods).forEach((methodName) => {
      const elements = this.el.querySelectorAll(`[data-onclick=${methodName}]`);
      elements.forEach((el) => {
        el.addEventListener('click', this.methods[methodName].bind(this.state));
      });
    });
  }
}

// Main framework object
const Act = {
  components: [],
  plugins: [],
  header: null,
  footer: null,
  
  createComponent(options) {
    const component = new ActComponent(options);
    this.components.push(component);
    return component;
  },

  use(plugin) {
    if (typeof plugin === 'function') {
      this.plugins.push(plugin);
      plugin(this);
    }
  },

  // New methods for header and footer
  createHeader(options) {
    this.header = new ActComponent({
      ...options,
      target: 'header'
    });
  },

  createFooter(options) {
    this.footer = new ActComponent({
      ...options,
      target: 'footer'
    });
  },

  // Method to render all components, including header and footer
  renderAll() {
    if (this.header) this.header.render();
    this.components.forEach(component => component.render());
    if (this.footer) this.footer.render();
  }
};

// Nail Salon Website Example
Act.createComponent({
  target: '#app',
  template: (state, methods) => `
    <main>
      <section id="content">
        ${methods.renderCurrentView()}
      </section>
    </main>
  `,
  data: {
    businessName: 'Glamour Nails Salon',
    currentView: 'home',
    services: [
      { name: 'Manicure', price: '$20' },
      { name: 'Pedicure', price: '$25' },
      { name: 'Gel Nails', price: '$30' },
    ],
    bookingForm: {
      name: '',
      date: '',
      time: '',
      service: '',
    },
  },
  methods: {
    renderCurrentView() {
      switch (this.currentView) {
        case 'home':
          return `<h2>Welcome to ${this.businessName}</h2><p>Experience the best nail care in town!</p>`;
        case 'services':
          return `
            <h2>Our Services</h2>
            <ul>
              ${this.services.map(service => `<li>${service.name} - ${service.price}</li>`).join('')}
            </ul>
          `;
        case 'booking':
          return `
            <h2>Book an Appointment</h2>
            <form>
              <input type="text" placeholder="Your Name" value="${this.bookingForm.name}" data-oninput="updateBookingForm" data-field="name" />
              <input type="date" value="${this.bookingForm.date}" data-oninput="updateBookingForm" data-field="date" />
              <input type="time" value="${this.bookingForm.time}" data-oninput="updateBookingForm" data-field="time" />
              <select data-oninput="updateBookingForm" data-field="service">
                <option value="">Select a Service</option>
                ${this.services.map(service => `<option value="${service.name}">${service.name}</option>`).join('')}
              </select>
              <button type="button" data-onclick="submitBooking">Submit</button>
            </form>
          `;
        case 'contact':
          return `
            <h2>Contact Us</h2>
            <p>Email: info@glamournails.com</p>
            <p>Phone: +1 (123) 456-7890</p>
          `;
        default:
          return '<p>Page not found</p>';
      }
    },
    updateBookingForm(event) {
      const field = event.target.dataset.field;
      this.bookingForm[field] = event.target.value;
    },
    submitBooking() {
      alert(`Appointment booked for ${this.bookingForm.name} on ${this.bookingForm.date} at ${this.bookingForm.time} for ${this.bookingForm.service}!`);
      this.currentView = 'home';
    }
  }
});

export default Act;
