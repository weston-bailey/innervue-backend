// functions that return server messages
module.exports = {
  test: () => { return { 
    message: {
      type: 'success',
      title: 'Success',
      content: 'Hello world',
      },
    }
  },
  internalError: (error) => { return { 
    message: {
      type: 'error',
      title: 'Internal Error',
      content: 'Internal server error, please contact the system admin.',
      },
    error
    }
  },
  resourceNotFound: () => { return { 
    message: {
      type: 'warning',
      title: 'Alert',
      content: 'Resource not found.',
      },
    }
  },
  responseTooShort: () => { return { 
    message: {
      type: 'info',
      title: 'Info',
      content: 'Please submit a response of at least four sentances.',
      },
    }
  },
  noQuestion: () => { return { 
    message: {
      type: 'info',
      title: 'Info',
      content: 'No question selected, please select a question and resubmit!',
      },
    }
  },
  alert: (content) => { return { 
    message: {
      type: 'warning',
      title: 'Alert',
      content: content,
      },
    }
  },
}