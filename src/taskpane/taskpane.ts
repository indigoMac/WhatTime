/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

/* global document, Office */

import { getUserData } from "../helpers/sso-helper";

Office.onReady((info) => {
  if (info.host === Office.HostType.Outlook) {
    const connectButton = document.getElementById("connectCalendarButton");
    const findTimesButton = document.getElementById("findTimesButton");

    if (connectButton) connectButton.onclick = connectCalendar;
    if (findTimesButton) findTimesButton.onclick = findOptimalTimes;
  }
});

export async function connectCalendar() {
  try {
    // Show loading state
    const messageArea = document.getElementById("message-area");
    if (messageArea) {
      messageArea.textContent = "Connecting to your calendar...";
    }

    // Use the existing SSO helper to get user data
    getUserData(handleCalendarConnection);
  } catch (error) {
    console.error("Error connecting calendar:", error);
    const messageArea = document.getElementById("message-area");
    if (messageArea) {
      messageArea.textContent =
        "Error connecting to calendar. Please try again.";
      messageArea.style.color = "red";
    }
  }
}

export function handleCalendarConnection(result: any): void {
  const messageArea = document.getElementById("message-area");
  const welcomeSection = document.getElementById("welcome-section");
  const calendarSection = document.getElementById("calendar-section");

  if (result && result.displayName) {
    // Successfully connected
    if (messageArea) {
      messageArea.textContent = `Connected as ${result.displayName}`;
      messageArea.style.color = "green";
    }

    // Hide welcome section and show calendar interface
    if (welcomeSection) welcomeSection.style.display = "none";
    if (calendarSection) calendarSection.style.display = "block";
  } else {
    if (messageArea) {
      messageArea.textContent = "Failed to connect calendar. Please try again.";
      messageArea.style.color = "red";
    }
  }
}

export async function findOptimalTimes() {
  const messageArea = document.getElementById("message-area");
  const meetingTitle = document.getElementById(
    "meetingTitle"
  ) as HTMLInputElement;
  const duration = document.getElementById(
    "meetingDuration"
  ) as HTMLSelectElement;
  const attendeeEmails = document.getElementById(
    "attendeeEmails"
  ) as HTMLTextAreaElement;

  if (!meetingTitle?.value || !attendeeEmails?.value) {
    if (messageArea) {
      messageArea.textContent = "Please fill in meeting title and attendees.";
      messageArea.style.color = "red";
    }
    return;
  }

  try {
    if (messageArea) {
      messageArea.textContent = "Finding optimal meeting times...";
      messageArea.style.color = "blue";
    }

    // Parse attendee emails
    const attendees = attendeeEmails.value
      .split("\n")
      .map((email) => email.trim())
      .filter((email) => email);

    // Call backend API to find optimal times
    const response = await fetch("/api/calendar/find-times", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        duration: parseInt(duration.value),
        attendees: attendees,
        title: meetingTitle.value,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      displaySuggestedTimes(data.suggestedTimes || []);
      if (messageArea) {
        messageArea.textContent = "Found optimal meeting times!";
        messageArea.style.color = "green";
      }
    } else {
      throw new Error(`API error: ${response.status}`);
    }
  } catch (error) {
    console.error("Error finding times:", error);
    if (messageArea) {
      messageArea.textContent =
        "Error finding meeting times. Please try again.";
      messageArea.style.color = "red";
    }
  }
}

function displaySuggestedTimes(times: any[]) {
  const suggestedTimesDiv = document.getElementById("suggestedTimes");
  const timeSlotsDiv = document.getElementById("timeSlots");

  if (!timeSlotsDiv) return;

  if (times.length === 0) {
    timeSlotsDiv.innerHTML =
      "<p>No suitable times found. Try different criteria.</p>";
  } else {
    timeSlotsDiv.innerHTML = times
      .map(
        (timeSlot, index) => `
      <div class="time-slot ms-ListItem" style="margin: 10px 0; padding: 10px; border: 1px solid #ccc; border-radius: 4px;">
        <strong>${new Date(timeSlot.startTime).toLocaleString()}</strong>
        <br>
        <small>Duration: ${timeSlot.duration} minutes</small>
        <br>
        <small>Confidence: ${timeSlot.confidence}%</small>
        <br>
        <button class="ms-Button ms-Button--primary" onclick="createMeeting('${
          timeSlot.startTime
        }', '${timeSlot.duration}')" style="margin-top: 5px;">
          <span class="ms-Button-label">Schedule This Time</span>
        </button>
      </div>
    `
      )
      .join("");
  }

  if (suggestedTimesDiv) {
    suggestedTimesDiv.style.display = "block";
  }
}

// Global function for creating meetings (called from HTML)
(window as any).createMeeting = async function (
  startTime: string,
  duration: string
) {
  const messageArea = document.getElementById("message-area");
  const meetingTitle = document.getElementById(
    "meetingTitle"
  ) as HTMLInputElement;
  const attendeeEmails = document.getElementById(
    "attendeeEmails"
  ) as HTMLTextAreaElement;

  if (!meetingTitle?.value || !attendeeEmails?.value) return;

  try {
    if (messageArea) {
      messageArea.textContent = "Creating meeting...";
      messageArea.style.color = "blue";
    }

    // Create meeting using Office.js
    const attendees = attendeeEmails.value
      .split("\n")
      .map((email) => email.trim())
      .filter((email) => email);
    const endTime = new Date(
      new Date(startTime).getTime() + parseInt(duration) * 60000
    );

    // Use Office.js to create appointment
    Office.context.mailbox.displayNewAppointmentForm({
      subject: meetingTitle.value,
      start: new Date(startTime),
      end: endTime,
      requiredAttendees: attendees,
      body: `Meeting scheduled using WhatTime\n\nDuration: ${duration} minutes`,
    });

    if (messageArea) {
      messageArea.textContent = "Meeting created successfully!";
      messageArea.style.color = "green";
    }
  } catch (error) {
    console.error("Error creating meeting:", error);
    if (messageArea) {
      messageArea.textContent = "Error creating meeting. Please try again.";
      messageArea.style.color = "red";
    }
  }
};
