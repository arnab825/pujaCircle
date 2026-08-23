# Use-Case Diagram & Actor Matrix - PujaCircle

```mermaid
graph LR
    Devotee((Devotee / User))
    Priest((Vedic Priest))
    Admin((Administrator))

    subgraph Authentication
        UC1[Sign In with Indian Mobile OTP]
        UC2[Manage Devotee Profile]
    end

    subgraph Address Management
        UC3[Add / Edit / Delete Address]
        UC4[Auto-resolve City/State from PIN]
        UC5[Set Default Address]
    end

    subgraph Discovery & Booking
        UC6[Browse Ritual Catalog]
        UC7[Search Verified Priests]
        UC8[Select Muhurat Time Slot]
        UC9[Book Puja (Offline Cash Payment)]
        UC10[View & Cancel Booking]
    end

    subgraph Priest Portal
        UC11[Register as Purohit]
        UC12[Manage Muhurat Availability Slots]
        UC13[View Scheduled Appointments & Venues]
    end

    subgraph Admin Portal
        UC14[Review Pending Priest Applications]
        UC15[Approve / Reject Priest Profiles]
    end

    Devotee --> UC1
    Devotee --> UC2
    Devotee --> UC3
    Devotee --> UC4
    Devotee --> UC5
    Devotee --> UC6
    Devotee --> UC7
    Devotee --> UC8
    Devotee --> UC9
    Devotee --> UC10

    Priest --> UC1
    Priest --> UC11
    Priest --> UC12
    Priest --> UC13

    Admin --> UC14
    Admin --> UC15
```
