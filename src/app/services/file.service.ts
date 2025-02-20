// src/app/services/file.service.ts
import { Injectable } from '@angular/core';
import { uploadData } from 'aws-amplify/storage';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor() {}

  /**
   * Uploads a file using Amplify's uploadData function.
   * Reads the file as an ArrayBuffer and uploads it.
   *
   * With the default backend configuration, files uploaded with
   * this method will be stored at the "protected" access level,
   * meaning Amplify will automatically prefix the key with "protected/<userId>/".
   *
   * @param file The file to upload.
   * @returns A Promise that resolves with the upload result.
   */
  uploadFile(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();

      // Read the file as an ArrayBuffer
      fileReader.readAsArrayBuffer(file);

      fileReader.onload = async (event: any) => {
        console.log("Complete file read successfully!", event.target.result);
        try {
          // Call uploadData with the file's data and its name as the path.
          // With your Amplify backend's defaultAccessLevel set to 'protected',
          // the file will automatically be stored under the user's folder.
          // const result = await uploadData({
          //   data: event.target.result,
          //   path: file.name,
          //   options: {
          //     contentType: file.type,
          //   }
          // });
          const result = await uploadData({
            data: event.target.result,
            // Use a function to build the path dynamically
            path: ({ identityId }) => `protected/${identityId}/${file.name}`,
            options: {
              contentType: file.type
            }
          });
          resolve(result);
        } catch (error) {
          console.error("Error uploading file:", error);
          reject(error);
        }
      };

      fileReader.onerror = (error) => {
        console.error("Error reading file:", error);
        reject(error);
      };
    });
  }
}