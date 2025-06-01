const apiUrl = 'https://683947786561b8d882afa179.mockapi.io/api/v1/Contacts';
const resource = 'contacts';

let deletedContacts = [];

window.onload = fetchContacts;

async function fetchContacts() {
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error('Failed to load contacts');
    const contacts = await response.json();
    displayContacts(contacts);
  } catch (error) {
    console.error(error);
    alert('Failed to load contacts');
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString();
}

function displayContacts(contacts) {
  const contactList = document.getElementById('contact-list');
  contactList.innerHTML = '';

  contacts.forEach(contact => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${contact.name}</td>
      <td>${contact.phone}</td>
      <td>${contact.date ? formatDate(contact.date) : 'N/A'}</td>
      <td>
        <button class="btn btn-sm btn-warning me-1" onclick="editContact(${contact.id}, '${contact.name}', '${contact.phone}')">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteContact(${contact.id})">Delete</button>
      </td>
    `;
    contactList.appendChild(row);
  });
}

async function addContact() {
  const nameField = document.getElementById('name');
  const phoneField = document.getElementById('phone');
  const name = nameField.value.trim();
  const phone = phoneField.value.trim();

  if (!name || !phone) {
    alert('Please enter both name and phone number.');
    return;
  }

  const newContact = {
    name,
    phone,
    date: new Date().toISOString()
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newContact)
    });

    if (!response.ok) throw new Error('Failed to add contact');

    await fetchContacts();
    nameField.value = '';
    phoneField.value = '';
  } catch (error) {
    console.error('Could not add contact:', error);
    alert('Could not add contact');
  }
}

function editContact(id, name, phone) {
  document.getElementById('name').value = name;
  document.getElementById('phone').value = phone;

  document.getElementById('addBtn').style.display = 'none';
  const updateBtn = document.getElementById('updateBtn');
  updateBtn.style.display = 'inline';

  updateBtn.onclick = () => updateContact(id);
}

async function updateContact(id) {
  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();

  if (!name || !phone) {
    alert('Please enter both name and phone number.');
    return;
  }

  try {
    const response = await fetch(`${apiUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone })
    });

    if (!response.ok) throw new Error('Failed to update contact');

    await fetchContacts();
    document.getElementById('name').value = '';
    document.getElementById('phone').value = '';
    document.getElementById('updateBtn').style.display = 'none';
    document.getElementById('addBtn').style.display = 'inline';
  } catch (error) {
    console.error(error);
    alert('Could not update contact');
  }
}

async function deleteContact(id) {
  const confirmDelete = confirm('Are you sure you want to delete this contact?');
  if (!confirmDelete) return;

  try {
    const response = await fetch(`${apiUrl}/${id}`);
    const contact = await response.json();
    contact.deletedDate = new Date().toISOString();
    deletedContacts.push(contact);

    const deleteResponse = await fetch(`${apiUrl}/${id}`, {
      method: 'DELETE'
    });

    if (!deleteResponse.ok) throw new Error('Failed to delete contact');

    await fetchContacts();
  } catch (error) {
    console.error(error);
    alert('Could not delete contact');
  }
}

function toggleDeleted() {
  const section = document.getElementById('deleted-section');
  const list = document.getElementById('deleted-list');

  if (section.style.display === 'none') {
    section.style.display = 'block';
    list.innerHTML = '';

    if (deletedContacts.length === 0) {
      list.innerHTML = '<li class="list-group-item">No deleted contacts yet.</li>';
    } else {
      deletedContacts.forEach(contact => {
        const added = contact.date ? formatDate(contact.date) : 'Unknown';
        const deleted = contact.deletedDate ? formatDate(contact.deletedDate) : 'Unknown';

        const li = document.createElement('li');
        li.className = 'list-group-item list-group-item-danger';
        li.innerHTML = `<strong>${contact.name}</strong> - ${contact.phone}<br/>
          <small>🟢 Added on: ${added} | 🔴 Deleted on: ${deleted}</small>`;
        list.appendChild(li);
      });
    }
  } else {
    section.style.display = 'none';
  }
}

async function searchContacts() {
  const query = document.getElementById('search').value.trim().toLowerCase();

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error('Failed to search');

    const contacts = await response.json();
    const filtered = contacts.filter(c =>
      c.name.toLowerCase().includes(query) || c.phone.includes(query)
    );
    displayContacts(filtered);
  } catch (error) {
    console.error(error);
    alert('Search failed');
  }
}