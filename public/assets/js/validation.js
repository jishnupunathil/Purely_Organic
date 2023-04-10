const form = document.getElementById('addProduct');
const nameInput = document.getElementById('name');
const descriptionInput = document.getElementById('description');

form.addEventListener('submit', function(event) {
  event.preventDefault();
  
  const name = nameInput.value.trim();
  const description = descriptionInput.value.trim();
  
  if (!name) {
    alert('Please enter a product name');
    return;
  }
  
  if (!description) {
    alert('Please enter a product description');
    return;
  }
  
  form.submit();
});