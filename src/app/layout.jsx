import AlertModal from "@/app/component/alertmodal/page";
import DatePickerModal from "@/app/component/datePicker/page";

export default function Layout({ children }) {
    return(
        <html>
        <head>
            <meta charSet="utf-8" />
            <title>JunKo</title>
        </head>
        <body>
        {children}
        <AlertModal />
        <DatePickerModal/>
        </body>
        </html>
    );
}