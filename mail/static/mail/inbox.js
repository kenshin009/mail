document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  //Submit
  document.querySelector('#compose-form').addEventListener('submit',sendEmail);

  // load the inbox
  load_mailbox('inbox');
});


function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-details').style.display = 'none';

 // fetch url and get all emails
  fetch(`/emails/${mailbox}`)
  .then((resp) => resp.json())
  .then((emails) => {
    console.log(emails)
    emails.forEach((email) => {
      const div = document.createElement('div');
      div.className = 'd-flex justify-content-between border border-secondary font-weight-bold mb-3'
      div.innerHTML = `
        <div class="p-2">
          <span class="mr-2">${email.sender}</span> <span class="text-muted">${email.subject}</span>
        </div>
        <div class="p-2">
          <span class="text-muted"> ${email.timestamp}</span>
        </div>
        
      `   
  
      // Check the email read or unread and Change the background according to it
      if (email.read === true) {
        div.classList.add('bg-light');
        div.classList.remove('font-weight-bold');
      }
 
      document.querySelector('#emails-view').append(div);

      // To view the email details
      div.addEventListener('click',() => {

         // Show email details view and hide other views
          document.querySelector('#email-details').style.display = 'block';
          document.querySelector('#emails-view').style.display = 'none';
          document.querySelector('#compose-view').style.display = 'none';
        
          // Update email - change unread to read
          fetch(`/emails/${email.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                read: true
            })
          });
            
          // View email
          fetch(`/emails/${email.id}`)
          .then(response => response.json())
          .then(email => { 

           
             // Show email details       
             document.querySelector('#email-details').innerHTML = `
                <strong>From: </strong> <span>${email.sender}</span> <br>
                <strong>To: </strong> <span>${email.recipients[0]}</span> <br>
                <strong>Subject: </strong> <span>${email.subject}</span> <br>
                <strong>Time: </strong> <span>${email.timestamp}</span> <br>
                <button class="btn btn-sm btn-outline-primary" id="reply">Reply</button>
                <button class="btn btn-sm btn-outline-primary" id="archive">Archive</button>
                <hr>
               <p>${email.body}</p>

              `
              // Check the email archived or not and change te text of archive button according to it
              if (email.archived === false) {
                    document.querySelector('#archive').innerText = 'Archive'
                  } else {
                    document.querySelector('#archive').innerText = 'Unarchive'
                  }

              // Check if the maibox is sent and hide archive button
              if (mailbox === 'sent') {
                document.querySelector('#archive').style.display = 'none';
              }

                // Add event listener to Archive button to archive and unarchive
              document.querySelector('#archive').addEventListener('click', () => {

                // Toggle betweeen archive and unarchive
                if (email.archived === false) {
                  //change archive to true
                    fetch(`/emails/${email.id}`, {
                      method: 'PUT',
                      body: JSON.stringify({
                          archived : true
                      })
                    });

                // Reload the mailbox
                load_mailbox('inbox');

                } else {
                  // change archive to false
                  fetch(`/emails/${email.id}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        archived : false
                    })
                  });
                // Reload the mailbox
                load_mailbox('archive')
                }
                  
                });
              
              // Add event listener to reply button
              document.querySelector('#reply').addEventListener('click',() => {
                 // Show compose view and hide other views
                  document.querySelector('#emails-view').style.display = 'none';
                  document.querySelector('#email-details').style.display = 'none';
                  document.querySelector('#compose-view').style.display = 'block';
   
                  // Pre-fill composition fields
                  document.querySelector('#compose-recipients').value = `${email.sender}`;
                  let subject = document.querySelector('#compose-subject');
                  // Check the subject contains 'Re:' 
                  if (email.subject.includes('Re:')) {
                    subject.value = `${email.subject}`
                  } else {
                    subject.value = `Re: ${email.subject}`
                  }
                  document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;
              })

          });
      });
   
    })
  })
  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
}


function sendEmail(e) {
  e.preventDefault();
  // Get input values
  let recipients = document.querySelector('#compose-recipients').value;
  let subject = document.querySelector('#compose-subject').value;
  let body = document.querySelector('#compose-body').value;

  // Fetch url and send email
  fetch('/emails',{
    method:'post',
    body:JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
  .then((resp) => resp.json())
  .then((data) => {
    console.log(data)
  
  })

   // load user's sent mailbox
   load_mailbox('sent')
}
