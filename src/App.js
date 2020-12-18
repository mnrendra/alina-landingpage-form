import { useState } from 'react'

import './App.css'

import listOfCountryCodes from './utils/listOfCountryCodes'
import listOfIdCellCodes from './utils/listOfIdCellCodes'

const API_URL = 'https://api.puspanegara.com'

const App = () => {
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [alert, setAlert] = useState({})
  const [phoneElStyle, setPhoneElStyle] = useState({})
  const [nameElStyle, setNameElStyle] = useState({})

  const validatePhone = (phone) => {
    if (typeof phone !== 'string' || phone.length < 3 || phone.length > 16) return false

    let dialCode
    let cellularCode
    let validPhoneByCountryCode
    let validPhoneByCellularCode

    listOfCountryCodes.some(country => {
      if (phone.includes(country.dial_code)) {
        const phoneSplitA = phone.split(country.dial_code)
        if (phoneSplitA[0] === '' && Number(phoneSplitA[1])) {
          dialCode = country.dial_code
          validPhoneByCountryCode = country.dial_code + Number(phoneSplitA[1])
          return true
        } else {
          return false
        }
      } else {
        return false
      }
    })

    listOfIdCellCodes.some(code => {
      if (phone.includes(code)) {
        const phoneSplitB = phone.split(code)
        if (phoneSplitB[0] === '' && Number(phoneSplitB[1])) {
          cellularCode = code
          validPhoneByCellularCode = phone.replace(0, '+62')
          return true
        } else {
          return false
        }
      } else {
        return false
      }
    })

    if (dialCode) {
      return {
        validPhone: validPhoneByCountryCode,
        dialCode: dialCode
      }
    } else if (cellularCode) {
      return {
        validPhone: validPhoneByCellularCode,
        cellularCode: cellularCode
      }
    } else {
      return {}
    }
  }

  const handlePhone = (e) => {
    e.preventDefault()
    const value = e.target.value.replace(/[^0-9]+/g, '').slice(0, 16)
    setPhone(value)
    setAlert({ text: '', color: '#424242' })
    setPhoneElStyle({ background: '#FFFFFF', borderColor: '#BDBDBD' })
  }

  const handleName = (e) => {
    const value = e.target.value.replace(/[^\w\s]/gi, '').slice(0, 32)
    setName(value)
    setAlert({ text: '', color: '#424242' })
    setNameElStyle({ background: '#FFFFFF', borderColor: '#BDBDBD' })
  }

  const handleSubmit = () => {
    const { validPhone } = validatePhone(phone)

    if (!validPhone) {
      setAlert({ text: 'Mohon isi nomor whatsapp yang valid!', color: '#F44336' })
      setPhoneElStyle({ background: '#FFCDD2', borderColor: '#F44336' })
    } else {
      if (!name) {
        setAlert({ text: 'Mohon isi nama Anda!', color: '#F44336' })
        setNameElStyle({ background: '#FFCDD2', borderColor: '#F44336' })
      } else {
        setAlert({ text: 'Loading ...', color: '#424242' })
        setPhoneElStyle({ background: '#FFFFFF', borderColor: '#BDBDBD' })
        setNameElStyle({ background: '#FFFFFF', borderColor: '#BDBDBD' })

        fetch(API_URL + '/lead', {
          method: 'POST', // *GET, POST, PUT, DELETE, etc.
          mode: 'cors', // no-cors, *cors, same-origin
          cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
          credentials: 'same-origin', // include, *same-origin, omit
          headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
          },
          redirect: 'follow', // manual, *follow, error
          referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
          body: JSON.stringify({
            phone,
            name
          })
        })
          .then(res => res.json())
          .then(json => {
            if (json.error) {
              setAlert({ text: json.error.message, color: '#F44336' })
            } else if (json.invalid) {
              setAlert({ text: json.invalid, color: '#F44336' })
            } else if (json.success) {
              const data = json.success && json.success.data ? json.success.data : {}
              const name = data.name || ''
              const phone = data.phone || ''
              setAlert({
                text: 'Terimakasih ' + name + '!\r\nTim kami akan segera menghubungi Anda di nomor ' + phone + '.',
                color: '#4CAF50'
              })
            } else {
              console.log('Response is unknown', json)
              setAlert({ text: 'Terjadi kesalahan, mohon ulangi lagi', color: '#FF9800' })
            }
          })
          .catch(e => {
            console.log('Catch ERROR when fetching: ' + API_URL + '/lead', e)
            setAlert({ text: 'Terjadi kerusakan di server, mohon hubungi admin di nomor 0852-2324-1381', color: '#F44336' })
          })
      }
    }
  }

  return (
    <div className='App'>
      <div className='form-signin'>
        <div className='text-center mb-4'>
          <h1 className='h3 mb-3 font-weight-normal'><strong>Formulir Pemesanan</strong></h1>
          <p style={{ textAlign: 'left' }}>1. Mohon diisi dengan <strong>BENAR</strong>&nbsp;&amp; <b>VALID</b> nomor&nbsp;<strong>WhatsApp</strong>&nbsp;Anda agar&nbsp;<strong>memudahkan</strong> kami untuk <strong>menghubungi</strong> Anda&nbsp;</p>
          <p style={{ textAlign: 'left' }}>2. Setelah itu tekan tombol/button “<strong>Kirimkan</strong>!”&nbsp;</p>
        </div>
        <p style={{ textAlign: 'center', color: alert.color }} id='alina-form-order-alert'>{alert.text}</p>
        <br />
        <p style={{ marginBottom: '8px' }}><b>Nomor WhatsApp Anda yang AKTIF &amp; VALID <span aria-hidden='true' role='presentation' className='field_required' style={{ color: '#ee0000' }}>*</span></b></p>
        <div className='form-label-group'>
          <input
            value={phone}
            onChange={handlePhone}
            id='inputPhone'
            className='form-control'
            placeholder='Nomor Whatsapp'
            type='text'
            style={phoneElStyle}
            required
          />
          <label htmlFor='inputPhone'>Nomor Whatsapp</label>
        </div>
        <p style={{ marginBottom: '8px' }}><b>Nama Anda <span aria-hidden='true' role='presentation' className='field_required' style={{ color: '#ee0000' }}>*</span></b></p>
        <div className='form-label-group'>
          <input
            value={name}
            onChange={handleName}
            id='inputName'
            className='form-control'
            placeholder='Nama'
            type='text'
            style={nameElStyle}
            required
          />
          <label htmlFor='inputName'>Nama</label>
        </div>
        <br />
        <button
          className='btn btn-lg btn-primary btn-block'
          id='submitButton'
          onClick={handleSubmit}
        >
          Kirimkan!
        </button>
        <p className='mt-5 mb-3 text-muted text-center'>&copy; 2020 - Alina Group Agency</p>
      </div>
    </div>
  )
}

export default App
